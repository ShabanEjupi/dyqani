/**
 * Netlify Serverless Function: POS Webhook Handler
 * Receives real-time updates from ASP.NET Core POS system
 * Syncs product inventory, orders, and other data to Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  // CORS headers for preflight requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-POS-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verify webhook signature
    const signature = event.headers['x-pos-signature'];
    const expectedSignature = process.env.POS_WEBHOOK_SECRET;
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const payload = JSON.parse(event.body);
    const { eventType, data } = payload;

    console.log(`Processing POS webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'product.created':
      case 'product.updated':
        await handleProductUpdate(data);
        break;

      case 'product.deleted':
        await handleProductDelete(data);
        break;

      case 'inventory.updated':
        await handleInventoryUpdate(data);
        break;

      case 'order.created':
        await handleOrderCreated(data);
        break;

      case 'order.updated':
        await handleOrderUpdate(data);
        break;

      default:
        console.warn(`Unknown event type: ${eventType}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Event ${eventType} processed successfully` 
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Handle product create/update
async function handleProductUpdate(productData) {
  const {
    pos_sync_id,
    name,
    description,
    price,
    stock_quantity,
    category,
    image_url,
    is_active
  } = productData;

  const { data, error } = await supabase
    .from('products')
    .upsert({
      pos_sync_id,
      name,
      description,
      price,
      stock_quantity,
      category,
      image_url,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'pos_sync_id'
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert product: ${error.message}`);
  }

  console.log(`Product ${pos_sync_id} synced successfully`);
  return data;
}

// Handle product deletion
async function handleProductDelete(productData) {
  const { pos_sync_id } = productData;

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('products')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('pos_sync_id', pos_sync_id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  console.log(`Product ${pos_sync_id} deactivated successfully`);
}

// Handle inventory updates
async function handleInventoryUpdate(inventoryData) {
  const { pos_sync_id, stock_quantity } = inventoryData;

  const { error } = await supabase
    .from('products')
    .update({ 
      stock_quantity,
      updated_at: new Date().toISOString()
    })
    .eq('pos_sync_id', pos_sync_id);

  if (error) {
    throw new Error(`Failed to update inventory: ${error.message}`);
  }

  console.log(`Inventory for ${pos_sync_id} updated to ${stock_quantity}`);
}

// Handle order creation
async function handleOrderCreated(orderData) {
  const {
    pos_sync_id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    items,
    subtotal,
    shipping_cost,
    discount,
    total_amount,
    payment_method,
    delivery_method,
    status,
    notes
  } = orderData;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      pos_sync_id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      subtotal,
      shipping_cost: shipping_cost || 0,
      discount: discount || 0,
      total_amount,
      payment_method,
      delivery_method,
      status: status || 'pending',
      notes,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  console.log(`Order ${order_number} created successfully`);
  return data;
}

// Handle order updates
async function handleOrderUpdate(orderData) {
  const { pos_sync_id, status, notes } = orderData;

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('pos_sync_id', pos_sync_id);

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }

  console.log(`Order ${pos_sync_id} updated successfully`);
}
