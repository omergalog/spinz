import { createClient } from '@supabase/supabase-js'

// דריסה רק לסביבת הבדיקה המקומית (test-harness). בבנייה רגילה המשתנים
// לא מוגדרים, והכתובות של הייצור נשארות.
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL || 'https://ayrwfyutpbkepnyjkyop.supabase.co'
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Yx3yf3sJdBr-I6fE5sQ44Q_BRiOttxN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
