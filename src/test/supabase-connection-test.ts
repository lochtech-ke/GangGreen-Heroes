/**
 * Supabase Connection Test
 * Run this to verify Supabase project is active and accessible
 */

import { supabase } from '../services/supabase';

export async function testSupabaseConnection() {
  console.log('=== Supabase Connection Test ===');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  try {
    // Test 1: Basic health check
    console.log('\n[Test 1] Testing basic connection...');
    const start1 = performance.now();
    const result = await Promise.race([
      supabase.from('users').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    const { error } = result as any;
    const duration1 = performance.now() - start1;
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('Duration:', duration1.toFixed(2), 'ms');
      return false;
    }
    console.log('✅ Connection successful');
    console.log('Duration:', duration1.toFixed(2), 'ms');
    
    // Test 2: Auth service check
    console.log('\n[Test 2] Testing auth service...');
    const start2 = performance.now();
    const authResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )
    ]);
    const { data: { session }, error: sessionError } = authResult as any;
    const duration2 = performance.now() - start2;
    
    if (sessionError) {
      console.error('❌ Auth service failed:', sessionError.message);
      console.log('Duration:', duration2.toFixed(2), 'ms');
      return false;
    }
    console.log('✅ Auth service accessible');
    console.log('Duration:', duration2.toFixed(2), 'ms');
    console.log('Current session:', session ? 'Active' : 'None');
    
    console.log('\n=== All tests passed ===');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return false;
  }
}

// Auto-run if imported
if (import.meta.env.DEV) {
  console.log('Run testSupabaseConnection() in console to test connection');
}
