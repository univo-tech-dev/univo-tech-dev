import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const authHeader = request.headers.get('Authorization');
    
    // Get current user (optional for this endpoint)
    let currentUserId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      currentUserId = user?.id || null;
    }

    // Get user's privacy settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('show_followers')
      .eq('id', userId)
      .single();

    // Check privacy settings (only block if not own profile and privacy is off)
    if (!profile?.show_followers && currentUserId !== userId) {
      return NextResponse.json({ 
        error: 'Followers list is private',
        isPrivate: true 
      }, { status: 403 });
    }

    // Get followers with profile info
    const { data: followers, error } = await supabase
      .from('user_follows')
      .select(`
        follower_id,
        created_at,
        follower:profiles!user_follows_follower_id_fkey (
          id,
          full_name,
          avatar_url,
          department,
          university
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Followers fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
    }

    // For each follower, check if current user follows them
    const followersWithStatus = await Promise.all(
      (followers || []).map(async (follow: any) => {
        let isFollowing = false;
        
        if (currentUserId) {
          const { data: followData } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', follow.follower_id)
            .single();
          
          isFollowing = !!followData;
        }

        return {
          ...follow.follower,
          isFollowing,
          followedAt: follow.created_at
        };
      })
    );

    return NextResponse.json({ 
      followers: followersWithStatus,
      count: followersWithStatus.length
    });

  } catch (error) {
    console.error('Followers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
