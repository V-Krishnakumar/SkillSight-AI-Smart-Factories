// Test Supabase connection
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('isSupabaseConfigured:', isSupabaseConfigured)
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase is not configured')
    return false
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('workers')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection error:', error)
      return false
    }

    console.log('✅ Supabase connection successful')
    return true
  } catch (err) {
    console.error('❌ Supabase test failed:', err)
    return false
  }
}

// Test assignments table
export async function testAssignmentsTable() {
  console.log('🔍 Testing assignments table...')
  
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Assignments table error:', error)
      return false
    }

    console.log('✅ Assignments table accessible')
    return true
  } catch (err) {
    console.error('❌ Assignments table test failed:', err)
    return false
  }
}
