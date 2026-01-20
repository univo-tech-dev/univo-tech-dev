
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, university');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  const counts = data.reduce((acc, p) => {
    acc[p.university] = (acc[p.university] || 0) + 1;
    return acc;
  }, {});

  console.log('University Distribution:', counts);
  
  // Also check if any Bilkent emails have METU university
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  const mismatches = [];
  data.forEach(profile => {
    const authUser = users.find(u => u.id === profile.id);
    if (authUser && authUser.email?.includes('bilkent.edu.tr') && profile.university === 'metu') {
        mismatches.push({ id: profile.id, email: authUser.email, university: profile.university });
    }
  });

  console.log('Bilkent users labeled as METU:', mismatches.length);
  if (mismatches.length > 0) {
      console.log('Sample mismatch:', mismatches[0]);
  }
}

checkData();
