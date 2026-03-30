import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://meaizdrxqalzvgtppxdi.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hGygmoGqzrgbHo9SOjul4A_v-Coj1XD';

export const supabase = createClient(supabaseUrl, supabaseKey);
