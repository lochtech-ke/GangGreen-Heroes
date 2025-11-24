import { useState } from 'react';
import { supabase } from '../../services/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<string>('Not tested');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('Testing...');
    console.log('[SupabaseTest] Starting connection test...');
    
    try {
      // Test 1: Basic connection with timeout
      const start = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
      });
      
      const queryPromise = supabase.from('users').select('count').limit(1);
      
      console.log('[SupabaseTest] Waiting for response...');
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      const duration = Date.now() - start;
      console.log('[SupabaseTest] Response received:', { data, error, duration });

      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`);
        setDetails({ error, duration: `${duration}ms` });
      } else {
        setStatus(`✅ Connection successful (${duration}ms)`);
        setDetails({ data, duration: `${duration}ms` });
      }
    } catch (err) {
      console.error('[SupabaseTest] Exception:', err);
      setStatus(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDetails({ error: err });
    }
  };

  const testAuth = async () => {
    setStatus('Testing auth...');
    console.log('[SupabaseTest] Starting auth test...');
    
    try {
      const start = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
      });
      
      const authPromise = supabase.auth.getSession();
      
      console.log('[SupabaseTest] Waiting for auth response...');
      const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      const duration = Date.now() - start;
      console.log('[SupabaseTest] Auth response received:', { session, error, duration });

      if (error) {
        setStatus(`❌ Auth check failed: ${error.message}`);
        setDetails({ error, duration: `${duration}ms` });
      } else {
        setStatus(`✅ Auth check successful (${duration}ms)`);
        setDetails({ session: session ? 'Active session' : 'No session', duration: `${duration}ms` });
      }
    } catch (err) {
      console.error('[SupabaseTest] Auth exception:', err);
      setStatus(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDetails({ error: err });
    }
  };

  const testLogin = async () => {
    const email = prompt('Enter test email:');
    const password = prompt('Enter test password:');
    
    if (!email || !password) {
      setStatus('❌ Cancelled');
      return;
    }

    setStatus('Testing login...');
    console.log('[SupabaseTest] Starting login test for:', email);
    
    try {
      const start = Date.now();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timed out after 15 seconds')), 15000);
      });
      
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('[SupabaseTest] Waiting for login response...');
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      const duration = Date.now() - start;
      console.log('[SupabaseTest] Login response received:', { data, error, duration });

      if (error) {
        setStatus(`❌ Login failed: ${error.message}`);
        setDetails({ error, duration: `${duration}ms` });
      } else {
        setStatus(`✅ Login successful (${duration}ms)`);
        setDetails({ user: data.user?.email, duration: `${duration}ms` });
      }
    } catch (err) {
      console.error('[SupabaseTest] Login exception:', err);
      setStatus(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDetails({ error: err });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Auth Service
          </button>
          
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Login
          </button>
          
          <button
            onClick={async () => {
              setStatus('Testing raw fetch...');
              console.log('[SupabaseTest] Testing raw fetch...');
              try {
                const start = Date.now();
                const response = await fetch('https://wobpryllvdjaapzjbsxx.supabase.co/rest/v1/', {
                  headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  },
                });
                const duration = Date.now() - start;
                console.log('[SupabaseTest] Fetch response:', response.status, duration);
                setStatus(`✅ Raw fetch successful: ${response.status} (${duration}ms)`);
                setDetails({ status: response.status, duration: `${duration}ms` });
              } catch (err) {
                console.error('[SupabaseTest] Fetch error:', err);
                setStatus(`❌ Fetch failed: ${err instanceof Error ? err.message : 'Unknown'}`);
                setDetails({ error: err });
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Raw Fetch
          </button>
          
          <button
            onClick={() => {
              console.log('[SupabaseTest] Clearing local storage...');
              localStorage.clear();
              sessionStorage.clear();
              setStatus('✅ Storage cleared! Please refresh the page.');
              setDetails({ message: 'All local and session storage cleared' });
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Storage & Refresh
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        {details && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h2 className="font-semibold mb-2">Details:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold mb-2">Environment Check:</h2>
          <p className="text-sm">
            <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}
          </p>
          <p className="text-sm">
            <strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}
