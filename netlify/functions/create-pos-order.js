/**
 * Netlify Serverless Function: Create Order in POS System
 * Sends order data from Supabase to ASP.NET POS API
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const orderData = JSON.parse(event.body);
    console.log('Creating order in POS system:', orderData.order_number);

    // Send order to POS API
    const posApiUrl = process.env.POS_API_URL;
    const posApiKey = process.env.POS_API_KEY;

    if (!posApiUrl || !posApiKey) {
      throw new Error('POS API configuration missing');
    }

    const response = await axios.post(
      `${posApiUrl}/orders`,
      {
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        discount: orderData.discount,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        delivery_method: orderData.delivery_method,
        notes: orderData.notes
      },
      {
        headers: {
          'Authorization': `Bearer ${posApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const posOrderId = response.data.id || response.data.orderId;

    // Update Supabase order with POS sync ID
    if (posOrderId && orderData.supabase_order_id) {
      await supabase
        .from('orders')
        .update({ 
          pos_sync_id: posOrderId.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.supabase_order_id);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order created in POS',
        pos_order_id: posOrderId
      })
    };

  } catch (error) {
    console.error('Error creating order in POS:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create order in POS',
        message: error.response?.data?.message || error.message
      })
    };
  }
};
