
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

async function cleanup() {
    const userId = 'da841708-0f0c-b311-040bf663e800'; // Salih's Bilkent ID
    console.log(`Deleting user ${userId}...`);
    
    // First, check if profiles exist to be safe
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
        console.log('Profile found:', profile.full_name, profile.university);
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            console.error('Error deleting auth user:', error.message);
        } else {
            console.log('Success: Salih`s duplicate Bilkent account deleted.');
        }
    } else {
        console.log('User profile not found or already deleted.');
    }
}

cleanup();
