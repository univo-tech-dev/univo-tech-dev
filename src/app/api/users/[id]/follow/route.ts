import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = user.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already following' }, { status: 200 });
    }

    // Create follow relationship
    const { error: followError } = await supabase
      .from('user_follows')
      .insert({
        follower_id: currentUserId,
        following_id: targetUserId
      });

    if (followError) {
      console.error('Follow error:', followError);
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }

    // Get follower's name for notification
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .single();

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'follow',
        actor_id: currentUserId,
        message: `${followerProfile?.full_name || 'Bir kullanıcı'} seni takip etmeye başladı`
      });

    // Get updated follower count
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    return NextResponse.json({ 
      message: 'Followed successfully',
      followerCount: count || 0 
    });

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = user.id;

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (unfollowError) {
      console.error('Unfollow error:', unfollowError);
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }

    // Get updated follower count
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    return NextResponse.json({ 
      message: 'Unfollowed successfully',
      followerCount: count || 0 
    });

  } catch (error) {
    console.error('Unfollow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ isFollowing: false, followerCount: 0 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ isFollowing: false, followerCount: 0 });
    }

    const currentUserId = user.id;

    // Check if following
    const { data: followData } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();

    // Get follower count
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    return NextResponse.json({ 
      isFollowing: !!followData,
      followerCount: count || 0
    });

  } catch (error) {
    console.error('Follow status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
