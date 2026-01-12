/**
 * Netlify Serverless Function: Sync Products from POS to Supabase
 * Periodically pulls product data from ASP.NET POS API
 * Can be triggered manually or via scheduled Netlify background function
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Starting POS to Supabase sync...');

    // Fetch products from ASP.NET POS API
    const posApiUrl = process.env.POS_API_URL;
    const posApiKey = process.env.POS_API_KEY;

    if (!posApiUrl || !posApiKey) {
      throw new Error('POS API configuration missing');
    }

    const response = await axios.get(`${posApiUrl}/products`, {
      headers: {
        'Authorization': `Bearer ${posApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const products = response.data;
    console.log(`Fetched ${products.length} products from POS`);

    // Sync each product to Supabase
    const syncResults = [];
    for (const product of products) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert({
            pos_sync_id: product.id.toString(),
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            stock_quantity: parseInt(product.stock_quantity) || 0,
            category: product.category || 'Uncategorized',
            image_url: product.image_url || '',
            is_active: product.is_active !== undefined ? product.is_active : true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'pos_sync_id'
          })
          .select();

        if (error) {
          console.error(`Error syncing product ${product.id}:`, error);
          syncResults.push({ id: product.id, success: false, error: error.message });
        } else {
          console.log(`Product ${product.id} synced successfully`);
          syncResults.push({ id: product.id, success: true });
        }
      } catch (err) {
        console.error(`Exception syncing product ${product.id}:`, err);
        syncResults.push({ id: product.id, success: false, error: err.message });
      }
    }

    const successCount = syncResults.filter(r => r.success).length;
    const failureCount = syncResults.filter(r => !r.success).length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sync completed',
        total: products.length,
        synced: successCount,
        failed: failureCount,
        results: syncResults
      })
    };

  } catch (error) {
    console.error('Sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Sync failed',
        message: error.message
      })
    };
  }
};
