// ✅ supabaseAdminClient.ts — khusus untuk server-side
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing or undefined');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
