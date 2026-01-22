
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabaseAdmin = createClient(url, key);

async function checkSalih() {
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
