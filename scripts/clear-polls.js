
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Hata: Supabase URL veya Service Role KEY eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearPollVotes() {
  console.log('Anket oyları temizleniyor...');
  
  // Truncate (delete all rows) from poll_votes
  const { error } = await supabase
    .from('poll_votes')
    .delete()
    .neq('poll_id', 'FORCE_DELETE_ALL_ROWS'); // This is a trick to delete everything since delete() needs a filter

  if (error) {
    console.error('Temizlik sırasında hata oluştu:', error);
  } else {
    console.log('Başarılı: Tüm anket oyları silindi. 🧹');
  }
}

clearPollVotes();
