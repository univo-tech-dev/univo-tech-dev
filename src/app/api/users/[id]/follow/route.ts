
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetUserId = id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    // Get Auth Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized: Missing Auth Header' }, { status: 401 });
    }

    // Initialize Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
    });

    // Verify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = user.id;

    if (followerId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Insert into followers table
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: targetUserId
      });

    if (error) {
      console.error('Follow error details:', error);
      if (error.code === '23505') { // Unique violation
         return NextResponse.json({ message: 'Already following' }, { status: 200 });
      }
      // Return actual error message for debugging
      return NextResponse.json({ error: error.message || 'Could not follow user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Followed successfully' });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
