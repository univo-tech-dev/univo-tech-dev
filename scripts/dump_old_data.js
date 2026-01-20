const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const OLD_URL = "https://oqgdnywowtfjenjmrmwi.supabase.co";
const OLD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ2RueXdvd3RmamVuam1ybXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAyNjY4MCwiZXhwIjoyMDgyNjAyNjgwfQ.ujQ3-3izWOoBXcONKeAmlZJnOdYzj9o8tZzyIAzata8";

const supabase = createClient(OLD_URL, OLD_KEY);

const tables = [
  'profiles',
  'admin_audit_logs',
  'admin_identities',
  'badges',
  'user_badges',
  'system_settings',
  'content_reports',
  'communities',
  'community_followers',
  'community_permission_requests',
  'community_posts',
  'community_post_comments',
  'community_comment_reactions',
  'community_post_reactions',
  'events',
  'event_attendees',
  'event_feedback',
  'campus_voices',
  'voice_reactions',
  'voice_comments',
  'voice_comment_reactions',
  'announcement_comments',
  'announcement_comment_reactions',
  'announcement_reads',
  'friendships',
  'notifications',
  'weekly_polls',
  'poll_votes',
  'user_follows',
  'followers'
];

async function dumpData() {
  let fullSql = "-- DATA MIGRATION SCRIPT (COMPLETE 29+ TABLES)\nSET session_replication_role = 'replica';\n\n";

  for (const table of tables) {
    console.log(`Fetching ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.warn(`Skipping ${table}: ${error.message}`);
      continue;
    }

    if (!data || data.length === 0) {
        console.log(`Table ${table} is empty.`);
        continue;
    }

    fullSql += `-- Table: ${table}\n`;
    for (const row of data) {
      const columnsArr = Object.keys(row);
      const columnsStr = columnsArr.join(', ');
      const values = columnsArr.map(col => {
        const v = row[col];
        if (v === null) return 'NULL';
        
        // Define JSONB columns to ensure strict quoting/casting
        const jsonbColumns = ['interests', 'privacy_settings', 'social_links', 'theme_preference', 'notification_settings', 'metadata', 'value'];
        
        // Handle TEXT[] columns
        if (Array.isArray(v) && (col === 'tags' || col === 'links' || col === 'options')) {
          return `ARRAY[${v.map(item => `'${String(item).replace(/'/g, "''")}'`).join(', ')}]::TEXT[]`;
        }
        
        // Handle JSONB columns (even if primitive number/boolean)
        if (jsonbColumns.includes(col)) {
          return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
        }

        // Handle JSONB and other objects (catch-all)
        if (typeof v === 'object') {
          return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        }
        
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        return v;
      }).join(', ');
      
      fullSql += `INSERT INTO public.${table} (${columnsStr}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
    }
    fullSql += "\n";
  }

  fullSql += "\nSET session_replication_role = 'origin';";
  fs.writeFileSync('database/DATA_MIGRATION.sql', fullSql);
  console.log('Finished! Saved to database/DATA_MIGRATION.sql');
}

dumpData();
