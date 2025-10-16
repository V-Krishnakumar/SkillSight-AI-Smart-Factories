import { createClient } from '@supabase/supabase-js'

// Debug logging
console.log('🔍 Supabase Debug Info:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined')
console.log('All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')))

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have real credentials
const hasRealCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

if (!hasRealCredentials) {
  console.error('❌ Supabase credentials not configured!')
  console.error('Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  console.error('Current values:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing' })
} else {
  console.log('✅ Supabase credentials configured successfully')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = hasRealCredentials
