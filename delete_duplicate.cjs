
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
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error.message);
    } else {
        console.log('Success: Salih`s duplicate Bilkent account deleted.');
    }
}

cleanup();
