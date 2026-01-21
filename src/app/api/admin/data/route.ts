import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import getSupabaseAdmin from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
    const session = await verifyAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    try {
        // 1. Fetch Users (From Profiles)
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (profilesError) throw profilesError;

        // 1.5 Fetch Emails from Auth (Admin only)
        // We need this to get emails which are not in public profiles
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Covers enough for MVP
        });

        if (authError) throw authError;

        // Merge email into profiles and identify orphans
        const orphans: string[] = [];
        const users = profiles.map(profile => {
            const authUser = authUsers.find(u => u.id === profile.id);
            if (!authUser) orphans.push(profile.id);
            return {
                ...profile,
                email: authUser?.email,
                is_orphaned: !authUser
            };
        });

        // Background Cleanup: Delete orphans if found
        if (orphans.length > 0) {
            console.log(`Cleaning up ${orphans.length} orphaned profiles...`);
            await supabase.from('profiles').delete().in('id', orphans);
        }

        // 2. Fetch Settings
        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('*');

        if (settingsError && settingsError.code !== '42P01') {
            // Ignore if table doesn't exist yet
        }

        // 3. Stats
        // Count exact users
        const { count: userCount, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });


        return NextResponse.json({
            users: users || [],
            settings: settings || [],
            stats: {
                totalUsers: userCount || 0,
            }
        });

    } catch (err: any) {
        console.error('Admin data fetch error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
