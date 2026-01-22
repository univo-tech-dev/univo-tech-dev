
import getSupabaseAdmin from './src/lib/supabase-admin.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSalih() {
    const supabaseAdmin = getSupabaseAdmin();
    console.log('Searching for Salih...');
    
    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('full_name', '%Salih%');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('Profiles found:', JSON.stringify(profiles, null, 2));

    if (profiles && profiles.length > 0) {
        for (const profile of profiles) {
            const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
            if (userError) {
                console.error(`Error fetching auth user for ${profile.id}:`, userError);
            } else {
                console.log('Auth User metadata:', JSON.stringify(user.user.user_metadata, null, 2));
                console.log('Auth User email:', user.user.email);
            }
        }
    }
}

checkSalih();
