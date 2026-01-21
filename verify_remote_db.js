
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually since we are running a standalone script
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    // Try to select 1 row, we expect 0 rows (empty table) or some rows, but NOT an error
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
        // failed
        // if code is 'PGRST204' (relation does not exist) or 404, table is missing
        console.log(`[FAIL] Table '${tableName}': ${error.message} (Code: ${error.code})`);
        return false;
    } else {
        console.log(`[OK]   Table '${tableName}' exists.`);
        return true;
    }
}

async function verify() {
    console.log(`Checking connection to: ${supabaseUrl}`);
    console.log('----------------------------------------');

    const tablesToCheck = [
        'profiles',
        'communities',
        'events',
        'weekly_polls',         // Check for new feature
        'community_posts',      // Check for chat feature
        'friendships'           // Check for new friendship feature
    ];

    let allGood = true;
    for (const table of tablesToCheck) {
        const exists = await checkTable(table);
        if (!exists) allGood = false;
    }

    console.log('----------------------------------------');
    if (allGood) {
        console.log('SUCCESS: All key tables seem to be present!');
    } else {
        console.log('WARNING: Some tables are missing. The database setup might be incomplete.');
    }
}

verify();
