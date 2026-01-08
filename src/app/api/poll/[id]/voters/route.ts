import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pollId } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        option_index,
        profiles:user_id (id, full_name, nickname, privacy_settings)
      `)
      .eq('poll_id', pollId);

    if (error) throw error;

    const formattedVoters = data.map((v: any) => {
      const p = v.profiles;
      const canShowName = p.privacy_settings?.show_polls !== false;
      
      return {
        option_index: v.option_index,
        user_id: p.id,
        // Privacy Logic:
        // 1. If privacy allows -> Full Name
        // 2. If privacy restricted -> Nickname (if set) OR "Rumuzlu Öğrenci"
        display_name: canShowName 
            ? p.full_name 
            : (p.nickname || 'Rumuzlu Öğrenci')
      };
    });

    return NextResponse.json({ voters: formattedVoters });
  } catch (error: any) {
    console.error('Voters API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
