import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import getSupabaseAdmin from '@/lib/supabase-admin';
import { analyzeCourses } from '@/lib/course-analyzer';
import { toTitleCase } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gereklidir.' }, { status: 400 });
    }

    // 1. Setup Cookie Jar
    const jar = new CookieJar();
    const client = wrapper(axios.create({ 
        jar,
        withCredentials: true,
        timeout: 30000, 
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        }
    }));

        // 2.1 Security Check: Prevent ODTÜ Students (IDs starting with 'e') and emails from leaking into Bilkent.
        // Bilkent students should only use their 8-digit numeric student ID.
        if (username.toLowerCase().startsWith('e') || username.includes('@') || isNaN(Number(username))) {
            return NextResponse.json({ 
                error: 'Bilkent girişi için lütfen sadece 8 haneli öğrenci numaranızı girin (örn: 22501234).' 
            }, { status: 400 });
        }

        const loginPageUrl = 'https://stars.bilkent.edu.tr/accounts/login';

        try {
            const initialRes = await client.get(loginPageUrl);

            // Bilkent users now use student ID (e.g. 22501234) for SRS/STARS
            const starsId = username.split('@')[0];
            const formData = new URLSearchParams();
            formData.append('LoginForm[username]', starsId);
            formData.append('LoginForm[password]', password);
            formData.append('yt0', 'Login');

            const loginRes = await client.post(loginPageUrl, formData, {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Referer': loginPageUrl 
                }
            });

            const isError = loginRes.data.includes('The password or Bilkent ID number entered is incorrect');

            if (isError) {
                // Restricted Mock Success: Only for specific test account
                if (username === 'bilkent_test') {
                    console.log('Bilkent STARS Mock success for test account');
                } else {
                    return NextResponse.json({ error: 'Giriş yapılamadı. Bilkent ID veya şifre hatalı.' }, { status: 401 });
                }
            }
        
        const $dash = cheerio.load(loginRes.data);
        
        // --- ROBUST NAME EXTRACTION ---
        // 1. Core SELECTORS (Top priority)
        // STARS and SRS use different layouts. We cover both.
        const selectors = [
            '.user-name', 
            '#user-menu-button', 
            '.usertext', 
            '.profile-name', 
            '.account-name',
            '.navbar-user',
            '.srs-user',
            'header .user-info',
            '.dropdown-toggle span',
            '#user-fullname',
            '.fullname',
            '.welcome-message b',
            '#ctl00_lblUser',
            '#lblName'
        ];
        
        let fullName = '';
        const html = loginRes.data;
        const $ = cheerio.load(html);

        for (const selector of selectors) {
            const text = $(selector).text().trim();
            if (text && !/Logout|Giriş|Çıkış|Welcome|Hoş\s+geldin/i.test(text)) {
                fullName = text;
                break;
            }
        }

        // 2. SEARCH specifically for SRS-style name containers
        if (!fullName) {
             const welcomeBox = $('div:contains("Hoş geldin"), div:contains("Welcome")').first();
             if (welcomeBox.length > 0) {
                 const text = welcomeBox.text().trim();
                 const match = text.match(/(?:Hoş geldin|Welcome),?\s+([^!.,\n\(]+)/i);
                 if (match && match[1]) {
                     fullName = match[1].trim();
                 }
             }
        }

        // 3. TITLE Case & Normalization
        if (fullName) {
            fullName = fullName.trim();
            // Remove titles or prefixes
            fullName = fullName.replace(/^(Sayın|Öğrenci|Mr\.|Ms\.|Dear)\s+/i, '');
            // Some systems might put the ID next to the name in paren: Ahmed Zafer (22501234)
            fullName = fullName.split('(')[0].trim();
            fullName = toTitleCase(fullName);
        } else if (username === 'bilkent_test') {
            fullName = 'Bilkent Test Kullanıcısı';
        } else {
            // If we STILL can't find it, we try to get it from a potential profile link
            console.warn(`[ROBUST SCRAPE] Name extraction failed for ${username}.`);
            fullName = username; // Last resort fallback to student ID
        }
        
        // --- COURSE SCRAPING ---
        let courses: { name: string, url: string }[] = [];
        try {
            // STARS usually has courses on the main page after login, or in specific tables.
            // We search for patterns like "CS 101", "MATH 106" in table cells or links.
            const courseElements = $dash('a, td, span').filter((_, el) => {
                const text = $dash(el).text().trim();
                return /^[A-Z]{2,4}\s?\d{3}/.test(text); // Matches CS 101, MATH106 etc.
            });

            courseElements.each((_, el) => {
                const name = $dash(el).text().trim();
                let url = $dash(el).attr('href') || '#';
                
                if (name && !courses.find(c => c.name === name)) {
                    courses.push({ name, url });
                }
            });
        } catch (scrapeErr) {
            console.warn('[Bilkent SCRAPE] Could not scrape courses:', scrapeErr);
        }

        let detectedDept = '';
        let detectedClass = '';
        if (courses.length > 0) {
            const results = analyzeCourses(courses);
            detectedDept = results.detectedDepartment || '';
            detectedClass = results.detectedClass || '';
        }
        
        // --- 3. UNIVO AUTHENTICATION ---
        // For Bilkent, we use internal identifiers like ID@bilkent.univo since emails are inconsistent
        const normalizedStarsId = username.split('@')[0];
        const eduEmail = `${normalizedStarsId}@bilkent.univo`;

        const supabaseAdmin = getSupabaseAdmin();
        
        // Find user
        let user: User | undefined;
        let page = 1;
        let hasNextPage = true;
        
        while (hasNextPage && !user) {
            const { data: { users: pageUsers }, error } = await supabaseAdmin.auth.admin.listUsers({
                page: page,
                perPage: 1000
            });
            
            if (error || !pageUsers || pageUsers.length === 0) {
                hasNextPage = false;
            } else {
                user = pageUsers.find(u => u.email?.toLowerCase() === eduEmail.toLowerCase());
                if (!user && pageUsers.length < 1000) {
                    hasNextPage = false;
                }
                page++;
            }
        }

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: eduEmail,
                password: randomPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName || username,
                    is_university_verified: true,
                    university: 'bilkent',
                    student_username: username,
                    department: detectedDept,
                    class_year: detectedClass,
                    bilkent_courses: courses
                }
            });

            if (createError) throw createError;
            user = newUser.user;

            if (user) {
                await supabaseAdmin.from('profiles').insert({
                    id: user.id,
                    full_name: fullName || username,
                    student_id: username,
                    department: detectedDept || null,
                    class_year: detectedClass || null,
                    is_university_verified: true,
                    role: 'student',
                    university: 'bilkent'
                });
            }
        } else {
             // Update Metadata
             const updates: any = {};
              if (fullName && user.user_metadata.full_name !== fullName) updates.full_name = fullName;
              if (!user.user_metadata.is_university_verified) updates.is_university_verified = true;
              if (detectedDept && !user.user_metadata.department) updates.department = detectedDept;
              if (detectedClass && !user.user_metadata.class_year) updates.class_year = detectedClass;
              if (courses.length > 0) updates.bilkent_courses = courses;
              
              if (Object.keys(updates).length > 0) {
                  await supabaseAdmin.auth.admin.updateUserById(user.id, {
                      user_metadata: { ...user.user_metadata, ...updates }
                  });
              }
              
              // Update Profile
              const pUpdates: any = {};
              if (fullName) pUpdates.full_name = fullName;
              if (detectedDept) pUpdates.department = detectedDept;
              if (detectedClass) pUpdates.class_year = detectedClass;

              if (Object.keys(pUpdates).length > 0) {
                  await supabaseAdmin.from('profiles').update(pUpdates).eq('id', user.id);
              }
        }

        // --- DIRECT SESSION CREATION ---
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: eduEmail
        });

        if (linkError) throw linkError;

        const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink'
        });

        if (verifyError) throw verifyError;

        return NextResponse.json({
            success: true,
            studentInfo: {
                fullName: fullName?.trim(),
                username: username,
                department: detectedDept || 'Bilkent Üniversitesi'
            },
            session: sessionData.session ? {
                access_token: sessionData.session.access_token,
                refresh_token: sessionData.session.refresh_token,
                expires_at: sessionData.session.expires_at
            } : null
        });

    } catch (err: any) {
        console.error('Bilkent Auth Error:', err.message);
        return NextResponse.json({ error: 'Bilkent sistemine bağlanılamadı: ' + err.message }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
  }
}
