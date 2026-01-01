
import { createClient } from '@supabase/supabase-js';

// These should be set in Vercel's Environment Variables UI
// We use a fallback to your provided keys so it works immediately, but env vars are preferred.
const supabaseUrl = (process.env.VITE_SUPABASE_URL as string) || 'https://ewfjnmkbfucvnnxulskb.supabase.co';
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_6KA3VwZBFrY9bhwHqChBsA_ELAOh2yx';

export const supabase = createClient(supabaseUrl, supabaseKey);
