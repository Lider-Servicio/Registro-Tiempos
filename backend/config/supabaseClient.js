const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- DEBUG SUPABASE CONFIG ---');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('KEY DEFINIDA:', !!supabaseServiceKey);
console.log('-----------------------------');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno necesarias: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidas en backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;