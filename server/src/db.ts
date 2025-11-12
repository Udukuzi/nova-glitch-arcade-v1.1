import { createClient } from '@supabase/supabase-js';

// Load environment early, before reading SUPABASE_* vars
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase env vars not set. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
