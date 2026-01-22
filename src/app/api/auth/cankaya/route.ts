import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import imaps from 'imap-simple';
import getSupabaseAdmin from '@/lib/supabase-admin';
import { toTitleCase } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli.' }, { status: 400 });
        }

        // Remove @cankaya.edu.tr if user included it
        const cleanUsername = username.includes('@') ? username.split('@')[0] : username;

        // ─── IMAP Authentication ───────────────────────────────────────────────
        const imapConfig = {
            imap: {
                user: cleanUsername,
                password: password,
                host: 'student.cankaya.edu.tr',
                port: 993,
                tls: true,
                authTimeout: 20000,
                tlsOptions: {
                    servername: 'student.cankaya.edu.tr'
                }
            }
        };

        let connection;
        let fullName = toTitleCase(cleanUsername);

        try {
            connection = await imaps.connect(imapConfig);

            // Try to get user's name from email headers
            try {
                await connection.openBox('INBOX');
                const searchCriteria = ['ALL'];
                const fetchOptions = {
                    bodies: ['HEADER.FIELDS (FROM)'],
                    struct: false
                };

                const messages = await connection.search(searchCriteria, fetchOptions);

                // Look for sent emails to get the user's display name
                if (messages.length > 0) {
                    for (const message of messages.slice(0, 10)) {
                        const headerPart = message.parts.find((p: any) => p.which === 'HEADER.FIELDS (FROM)');
                        if (headerPart?.body?.from?.[0]) {
                            const fromHeader = headerPart.body.from[0];
                            // Extract name from "Name <email>" or Name <email> format
                            const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*</) ||
                                              fromHeader.match(/^([^<]+)</);
                            if (nameMatch && nameMatch[1]) {
                                // Remove any remaining quotes and trim
                                const extractedName = nameMatch[1].replace(/"/g, '').trim();
                                if (extractedName && !extractedName.includes('@') && extractedName.length > 2) {
                                    fullName = toTitleCase(extractedName);
                                    break;
                                }
                            }
                        }
                    }
                }
            } catch (boxError) {
                console.log('Could not read mailbox for name extraction, using username');
            }

            connection.end();
        } catch (imapError: any) {
            console.error('IMAP Error:', imapError);

            if (imapError.source === 'authentication') {
                return NextResponse.json({
                    error: 'Kullanıcı adı veya şifre hatalı.'
                }, { status: 401 });
            }

            return NextResponse.json({
                error: 'Mail sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.'
            }, { status: 503 });
        }

        // ─── Supabase User Management ──────────────────────────────────────────
        const supabaseAdmin = getSupabaseAdmin();
        const eduEmail = `${cleanUsername.toLowerCase()}@cankaya.edu.tr`;

        // Pagination handling to find user by email
        let user: User | null = null;
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
                // Case-insensitive match
                const foundUser = pageUsers.find((u: User) => u.email?.toLowerCase() === eduEmail.toLowerCase());
                if (foundUser) {
                    user = foundUser;
                } else if (pageUsers.length < 1000) {
                    hasNextPage = false;
                }
                page++;
            }
        }

        if (!user) {
            // Create new user
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: eduEmail,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    university: 'cankaya'
                }
            });

            if (createError) {
                console.error('User creation error:', createError);
                return NextResponse.json({ error: 'Kullanıcı oluşturulamadı.' }, { status: 500 });
            }
            user = newUser.user;

            // Update profile with university
            await supabaseAdmin.from('profiles').upsert({
                id: user.id,
                full_name: fullName,
                university: 'cankaya'
            }, { onConflict: 'id' });
        } else {
            // Update existing user's profile if needed
            await supabaseAdmin.from('profiles').upsert({
                id: user.id,
                university: 'cankaya'
            }, { onConflict: 'id' });
        }

        // Generate magic link session
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: eduEmail
        });

        if (linkError || !linkData) {
            console.error('Magic link error:', linkError);
            return NextResponse.json({ error: 'Oturum oluşturulamadı.' }, { status: 500 });
        }

        // Extract token and create session
        const tokenHash = new URL(linkData.properties.action_link).searchParams.get('token');

        const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
            token_hash: tokenHash!,
            type: 'magiclink'
        });

        if (verifyError || !sessionData.session) {
            console.error('Session verify error:', verifyError);
            return NextResponse.json({ error: 'Oturum doğrulanamadı.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            studentInfo: {
                fullName: fullName,
                username: cleanUsername,
                department: 'Çankaya Üniversitesi'
            },
            session: {
                access_token: sessionData.session.access_token,
                refresh_token: sessionData.session.refresh_token
            }
        });

    } catch (error: any) {
        console.error('Çankaya auth error:', error);
        return NextResponse.json({
            error: error.message || 'Sunucu hatası'
        }, { status: 500 });
    }
}
