const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL или SUPABASE_SERVICE_KEY не настроены в .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase подключен');
module.exports = supabase;