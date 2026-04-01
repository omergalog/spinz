import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ayrwfyutpbkepnyjkyop.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Yx3yf3sJdBr-I6fE5sQ44Q_BRiOttxN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
