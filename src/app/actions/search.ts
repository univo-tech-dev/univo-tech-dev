
'use server';

import { createClient } from '@supabase/supabase-js';

// We need a Service Role client or just standard client depending on RLS.
// For search, usually standard anon client is enough if RLS policies allow reading.
// Initializing a simple client here for server-side use. 
// Ideally should use @supabase/ssr package context but for simple actions:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SearchResults {
  events: any[];
  voices: any[];
  announcements: any[];
  users: any[];
}

export async function searchContent(query: string): Promise<SearchResults> {
  if (!query || query.length < 2) {
      return { events: [], voices: [], announcements: [], users: [] };
  }

  const searchQuery = `%${query}%`;

  // Parallel Queries
  // 1. Events
  const eventsPromise = supabase
      .from('events')
      .select('id, title, date, location, category')
      .ilike('title', searchQuery)
      .limit(5);

  // 2. Voices (Approved)
  const voicesPromise = supabase
      .from('campus_voices')
      .select('id, content, created_at')
      .eq('moderation_status', 'approved')
      .ilike('content', searchQuery)
      .limit(5);

  // 3. Users
  const usersPromise = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, department, class_year')
      .ilike('full_name', searchQuery)
      .limit(5);

  const [eventsResult, voicesResult, usersResult] = await Promise.all([
      eventsPromise,
      voicesPromise,
      usersPromise
  ]);

  if (eventsResult.error) console.error('Search Events Error:', eventsResult.error);
  if (voicesResult.error) console.error('Search Voices Error:', voicesResult.error);
  if (usersResult.error) console.error('Search Users Error:', usersResult.error);

  return {
      events: eventsResult.data || [],
      voices: voicesResult.data || [],
      announcements: [],
      users: usersResult.data || []
  };
}
