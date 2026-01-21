import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { toTitleCase } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase Environment Variables');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get('tags'); // Support comma-separated tags
    const userId = searchParams.get('user_id');
    const isAnonymous = searchParams.get('is_anonymous');
    const hasImage = searchParams.get('has_image');
    const sort = searchParams.get('sort');
    const university = searchParams.get('university'); // University filter

    // Parse tags into array
    const tags = tagsParam ? tagsParam.split(',').filter(t => t.trim().length > 0) : [];

    // 1. Try with nickname
    let query = supabase
      .from('campus_voices')
      .select(`
        *,
        image_url,
        profiles:user_id (full_name, nickname, department, avatar_url, student_id, class_year, university),
        voice_reactions (user_id, reaction_type),
        voice_comments (
          id, content, created_at, user_id, parent_id,
          user:user_id (full_name, avatar_url, department, class_year, university),
          voice_comment_reactions (user_id, reaction_type)
        )
      `)
      .eq('moderation_status', 'approved');

    if (tags.length > 0) {
      // Supabase .contains for array column
      query = query.contains('tags', tags);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (isAnonymous !== null && isAnonymous !== undefined) {
      query = query.eq('is_anonymous', isAnonymous === 'true');
    }

    if (hasImage === 'true') {
      query = query.not('image_url', 'is', null);
    } else if (hasImage === 'false') {
      query = query.is('image_url', null);
    }

    // Always sort by newest first by default or specified
    query = query.order('created_at', { ascending: false }).limit(100);

    let { data, error } = await query as any;

    // 2. Fallback if nickname column doesn't exist yet
    if (error && error.message.includes('nickname')) {
      console.warn('Nickname column missing, falling back...');
      let fallbackQuery = supabase
        .from('campus_voices')
        .select(`
          *,
          profiles:user_id (full_name, department, avatar_url, student_id, class_year, university),
          voice_reactions (user_id, reaction_type),
          voice_comments (
            id, content, created_at, user_id, parent_id,
            user:user_id (full_name, avatar_url, department, class_year, university),
            voice_comment_reactions (user_id, reaction_type)
          )
        `)
        .eq('moderation_status', 'approved');
      
      if (tags.length > 0) {
        fallbackQuery = fallbackQuery.contains('tags', tags);
      }

      if (userId) {
        fallbackQuery = fallbackQuery.eq('user_id', userId);
      }

      if (isAnonymous !== null && isAnonymous !== undefined) {
        fallbackQuery = fallbackQuery.eq('is_anonymous', isAnonymous === 'true');
      }

      if (hasImage === 'true') {
        fallbackQuery = fallbackQuery.not('image_url', 'is', null);
      } else if (hasImage === 'false') {
        fallbackQuery = fallbackQuery.is('image_url', null);
      }
      
      fallbackQuery = fallbackQuery.order('created_at', { ascending: false }).limit(100);
      
      const fallbackResult = await fallbackQuery as any;
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('Error fetching voices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Post-Fetch Filtering by University (Democratic & Robust)
    // We do this in JS to avoid complex Supabase join filter issues with NULL values
    let filteredData = data as any[] || [];
    
    if (university === 'global') {
       // Global Feed: ONLY posts tagged with #global
       filteredData = filteredData.filter(voice => {
         const tags = voice.tags || [];
         return tags.some((t: string) => t.toLowerCase().replace('#', '') === 'global');
       });
    } else if (university) {
       // Local Feed: Exclude posts tagged #global AND match university
       filteredData = filteredData.filter(voice => {
        // 1. Exclude Global Posts
        const tags = voice.tags || [];
        const isGlobal = tags.some((t: string) => t.toLowerCase().replace('#', '') === 'global');
        if (isGlobal) return false;

        // 2. University Match Logic
        const p = Array.isArray(voice.profiles) ? voice.profiles[0] : voice.profiles;
        const profileUni = p?.university;
        
        if (university === 'metu') {
          // ODTÜ students see METU posts + legacy posts (null)
          return profileUni === 'metu' || profileUni === null || profileUni === undefined || profileUni === '';
        }
        
        // Other universities see exact matches
        return profileUni === university;
      });
    }

    const formattedData = filteredData.map((voice: any) => {
      const likes = (voice.voice_reactions || []).filter((r: any) => r.reaction_type === 'like').length;
      const dislikes = (voice.voice_reactions || []).filter((r: any) => r.reaction_type === 'dislike').length;
      const commentsCount = (voice.voice_comments || []).length;
      
      const cleanDept = (dept: string) => {
        if (!dept) return dept;
        return dept.replace(/\.base$/i, '').replace(/\s*BASE$/i, '').replace(/\s*DBE$/i, '').trim();
      };

      const profile = Array.isArray(voice.profiles) ? voice.profiles[0] : voice.profiles;
      let user = voice.is_anonymous ? 
        { full_name: 'Rumuzlu Öğrenci', nickname: profile?.nickname, department: '', avatar_url: null } : 
        { ...profile };

      if (user && user.full_name && !voice.is_anonymous) {
        user.full_name = toTitleCase(user.full_name);
      }
      
      if (user && user.department) {
        user.department = cleanDept(user.department);
      }

      const isVerified = !voice.is_anonymous && profile?.student_id && profile.student_id.length > 0;

      // ALGORITHM: Calculate Univo Rank Score (Democratic Version)
      const baseValue = 10;
      const engagementPoints = (likes * 1) + (commentsCount * 3);
      
      const postDate = new Date(voice.created_at);
      const now = new Date();
      const hoursSincePost = Math.max(0, (now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
      const recencyMultiplier = 1 / Math.pow(hoursSincePost + 2, 1.5);
      
      const univoRank = (baseValue + engagementPoints) * recencyMultiplier;

      return {
        id: voice.id,
        user_id: voice.user_id,
        content: voice.content,
        image_url: voice.image_url,
        is_anonymous: voice.is_anonymous,
        is_editors_choice: voice.is_editors_choice,
        is_verified: isVerified,
        tags: voice.tags,
        user,
        counts: {
          likes,
          dislikes,
          comments: commentsCount
        },
        univoRank, // Include score for sorting or debugging
        reactions: voice.voice_reactions || [],
        comments: (voice.voice_comments || []).map((c: any) => {
           const cLikes = (c.voice_comment_reactions || []).filter((r: any) => r.reaction_type === 'like').length;
           const cDislikes = (c.voice_comment_reactions || []).filter((r: any) => r.reaction_type === 'dislike').length;
           return {
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            user: toTitleCase(c.user?.full_name || 'Kullanıcı'),
            user_avatar: c.user?.avatar_url,
            user_department: c.user?.department ? cleanDept(c.user.department) : null,
            user_class: c.user?.class_year,
            user_university: c.user?.university,
            user_id: c.user_id,
            parent_id: c.parent_id,
            reactions: { count: cLikes - cDislikes, data: c.voice_comment_reactions || []}
          };
        }),
        created_at: voice.created_at
      };
    });

    // Default to 'best' if sort parameter is not specified or set to 'best'
    const sortType = sort || 'best';
    
    if (sortType === 'best') {
      formattedData.sort((a, b) => b.univoRank - a.univoRank);
    } // else: already sorted by created_at DESC from database query

    return NextResponse.json({ voices: formattedData });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase Environment Variables');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Auth Header' }, { status: 401 });
    }

    // Initialize Supabase with the user's token so RLS works
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // We can still verify the user for our own logic
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth Error:', authError);
      return NextResponse.json({ error: `Unauthorized: ${authError?.message || 'No User'}` }, { status: 401 });
    }

    const json = await request.json();
    const { content, is_anonymous, tags, image_url } = json;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // 1-Minute Limit Check
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const { count, error: limitError } = await supabase
      .from('campus_voices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo.toISOString());

    if (limitError) {
      console.error('Limit check error:', limitError);
      return NextResponse.json({ error: 'Limit check failed' }, { status: 500 });
    }

    if (count && count >= 1) {
      return NextResponse.json({ error: 'Çok hızlı gidiyorsun! Lütfen 1 dakika bekle.' }, { status: 429 });
    }

    // --- University Validation ---
    // Fetch user's profile to get their university and admin status
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('university, role, is_admin')
      .eq('id', user.id)
      .single();

    const userUniversity = userProfile?.university || 'metu'; // Default to metu for legacy users
    const isAdmin = userProfile?.role === 'admin' || userProfile?.is_admin === true;

    // Check if post contains #global tag
    const hasGlobalTag = (tags || []).some((t: string) => 
      t.toLowerCase().replace('#', '') === 'global'
    );

    // Non-admin users can only post to their own university or global
    // For now, we don't restrict global posts, only local posts
    if (!isAdmin && !hasGlobalTag) {
      // The post will be associated with the user's profile university
      // This is already handled by the filtering logic in GET
      // But we log for monitoring
      console.log(`User ${user.id} posting to ${userUniversity} feed`);
    }
    // --------------------------

    const { data, error } = await supabase
      .from('campus_voices')
      .insert({
        user_id: user.id,
        content: content.substring(0, 280),
        image_url: image_url || null,
        is_anonymous: is_anonymous || false,
        tags: tags || [],
        moderation_status: 'approved'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating voice:', error);
      // This error message will likely be "relation ... does not exist" if DB is missing
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ voice: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
