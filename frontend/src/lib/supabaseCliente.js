import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://gehqwechqranxuofmhni.supabase.co';

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHF3ZWNocXJhbnh1b2ZtaG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjkyODcsImV4cCI6MjEwNTI0NTI4N30.c6A6nXshMO05j048cAQS2v3Fvmmzts_TRnRMKz_A_78';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);