// Temporary debug component to test database connection
// Remove this after testing

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugDatabase = () => {
  const [status, setStatus] = useState('Checking...');
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('products').select('count(*)');
        
        if (error) {
          setStatus(`Database Error: ${error.message}`);
          return;
        }

        // Test if we can actually fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, created_at')
          .limit(5);

        if (productsError) {
          setStatus(`Products Error: ${productsError.message}`);
          return;
        }

        setProductCount(products?.length || 0);
        setStatus(`✅ Connected! Found ${products?.length} products`);
        console.log('Products found:', products);
        
      } catch (err) {
        setStatus(`Connection Error: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'black', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <strong>DB Debug:</strong><br/>
      {status}<br/>
      {productCount !== null && `Products: ${productCount}`}
    </div>
  );
};
