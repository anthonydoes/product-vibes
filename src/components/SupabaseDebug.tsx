// Temporary debug component to test Supabase connection
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseDebug = () => {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('products').select('count', { count: 'exact' });
        
        setDebug({
          url: import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
          error: error?.message,
          success: !error,
          count: data?.length || 0
        });
      } catch (err) {
        setDebug({
          url: import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          error: 'Connection failed: ' + (err as Error).message,
          success: false
        });
      }
    };

    testConnection();
  }, []);

  // Only show in development or when there's an error
  if (!debug.error && import.meta.env.PROD) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'red', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Supabase Debug</h4>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
};

export default SupabaseDebug;
