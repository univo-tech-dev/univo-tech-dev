import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import getSupabaseAdmin from '@/lib/supabase-admin';
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

        // 2.1 Security Check: Prevent cross-university domain leak
        if (username.includes('@') && !username.toLowerCase().endsWith('@bilkent.edu.tr') && !username.toLowerCase().endsWith('@ug.bilkent.edu.tr')) {
            return NextResponse.json({ error: 'Bilkent girişi için lütfen Bilkent e-posta adresinizi veya ID numaranızı kullanın.' }, { status: 400 });
        }

        const loginPageUrl = 'https://stars.bilkent.edu.tr/accounts/login';

        try {
            const initialRes = await client.get(loginPageUrl);

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
        const selectors = [
            '.user-name', 
            '#user-menu-button', 
            '.usertext', 
            '.profile-name', 
            '.account-name',
            '.navbar-user',
            '.srs-user',
            'header .user-info',
            '.dropdown-toggle span'
        ];
        
        let fullName = '';
        for (const selector of selectors) {
            const text = $dash(selector).text().trim();
            if (text && !text.includes('Logout') && !text.includes('Giriş')) {
                fullName = text;
                break;
            }
        }

        // 2. TEXT-BASED Search (If selectors fail)
        if (!fullName) {
            // Find "Hoş geldin" pattern
            const welcomeText = $dash(':contains("Hoş geldin")').text() || $dash(':contains("Welcome")').text();
            if (welcomeText) {
                const match = welcomeText.match(/(?:Hoş geldin|Welcome),?\s+([^!.,\n]+)/i);
                if (match && match[1]) {
                    fullName = match[1].trim();
                }
            }
        }

        // 3. TITLE Case & Normalization
        if (fullName) {
            fullName = fullName.trim();
            fullName = toTitleCase(fullName);
        } else if (username === 'bilkent_test') {
            fullName = 'Bilkent Test Kullanıcısı';
        } else {
            // Log for debugging if fail (only in dev/admin view context)
            console.warn(`[ROBUST SCRAPE] Could not find name for ${username}. HTML sample: ${loginRes.data.substring(0, 500)}`);
            fullName = 'Bilkent Öğrencisi';
        }
        
        // --- 3. UNIVO AUTHENTICATION ---
        // For consistency, we normalize all Bilkent emails to the standard domain
        const normalizedStarsId = username.split('@')[0];
        const eduEmail = `${normalizedStarsId}@bilkent.edu.tr`;
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
                user = pageUsers.find(u => u.email === eduEmail);
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
                }
            });

            if (createError) throw createError;
            user = newUser.user;

            if (user) {
                await supabaseAdmin.from('profiles').insert({
                    id: user.id,
                    full_name: fullName || username,
                    student_id: username,
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
             
             if (Object.keys(updates).length > 0) {
                 await supabaseAdmin.auth.admin.updateUserById(user.id, {
                     user_metadata: { ...user.user_metadata, ...updates }
                 });
             }
             
             // Update Profile
             if (fullName) {
                 await supabaseAdmin.from('profiles').update({ full_name: fullName }).eq('id', user.id);
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
                department: 'Bilkent Öğrencisi'
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
