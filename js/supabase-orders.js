/**
 * Supabase Order Management
 * Creates and syncs orders with Supabase and ASP.NET POS
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create order in Supabase and sync to POS
export async function createOrder(orderData) {
  try {
    console.log('Creating order in Supabase...', orderData);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare order object
    const order = {
      order_number: orderNumber,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_address: {
        street: orderData.street,
        city: orderData.city,
        postalCode: orderData.postalCode,
        country: orderData.country || 'Kosovo'
      },
      items: orderData.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost || 0,
      discount: orderData.discount || 0,
      total_amount: orderData.totalAmount,
      status: 'pending',
      payment_method: orderData.paymentMethod,
      delivery_method: orderData.deliveryMethod,
      notes: orderData.notes || '',
      created_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('Order created in Supabase:', data);

    // Sync to POS system
    try {
      await syncOrderToPOS(data);
    } catch (posError) {
      console.error('Failed to sync to POS (order still created in Supabase):', posError);
      // Order is still created in Supabase, so we don't throw
    }

    // Update product stock
    await updateProductStock(orderData.items);

    return {
      success: true,
      orderId: data.id,
      orderNumber: data.order_number,
      order: data
    };

  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Sync order to POS system
async function syncOrderToPOS(order) {
  try {
    const response = await fetch('/.netlify/functions/create-pos-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supabase_order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        items: order.items,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        discount: order.discount,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        delivery_method: order.delivery_method,
        notes: order.notes
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to sync to POS');
    }

    console.log('Order synced to POS:', result.pos_order_id);
    return result;

  } catch (error) {
    console.error('POS sync error:', error);
    throw error;
  }
}

// Update product stock after order
async function updateProductStock(items) {
  try {
    for (const item of items) {
      const { error } = await supabase.rpc('decrement_stock', {
        product_id: item.id,
        quantity: item.quantity
      });

      if (error) {
        console.error(`Failed to update stock for ${item.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
  }
}

// Get order by ID
export async function getOrder(orderId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Get order by order number
export async function getOrderByNumber(orderNumber) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Get customer orders
export async function getCustomerOrders(customerEmail) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    console.log('Order status updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

// Export for global access
window.supabaseOrders = {
  createOrder,
  getOrder,
  getOrderByNumber,
  getCustomerOrders,
  updateOrderStatus
};
