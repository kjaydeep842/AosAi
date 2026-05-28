import { createClient } from '@supabase/supabase-js';

// Supabase public credentials - anon key is safe to commit (public client key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
  || 'https://pzgbfmhjsihzhputxjax.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Z2JmbWhqc2loemhwdXR4amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzA4NjQsImV4cCI6MjA5NTUwNjg2NH0.uJXiOzS36VtVGBcjuidiETAt7I0SMEW78ztqoeZLAPo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
