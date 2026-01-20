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
        // Fetch all communities with admin's university
        const { data: communities, error: communitiesError } = await supabase
            .from('communities')
            .select(`
                *,
                profiles:admin_id (full_name, university)
            `)
            .order('created_at', { ascending: false });

        if (communitiesError) throw communitiesError;

        // Fetch Follower Counts
        const { data: followers, error: followersError } = await supabase
            .from('community_followers')
            .select('community_id');

        if (followersError) throw followersError;

        // Fetch Event Counts
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('community_id');

        if (eventsError) throw eventsError;

        // Aggregate stats
        const communityStats = communities.map(community => {
            const followerCount = followers.filter(f => f.community_id === community.id).length;
            const eventCount = events.filter(e => e.community_id === community.id).length;
            
            return {
                ...community,
                follower_count: followerCount,
                event_count: eventCount,
                admin_name: community.profiles?.full_name || 'Bilinmiyor',
                university: community.profiles?.university || 'metu' // Default to metu for old communities
            };
        });

        return NextResponse.json({ communities: communityStats });

    } catch (err: any) {
        console.error('Admin communities fetch error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
