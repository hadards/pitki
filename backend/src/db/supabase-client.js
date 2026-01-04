import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute a query with user context for RLS
 * @param {string} userId - Telegram user ID
 * @param {Function} queryFn - Function that performs the query
 */
export async function withUserContext(userId, queryFn) {
  // Set user context for RLS
  await supabase.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId.toString()
  });

  return await queryFn();
}
