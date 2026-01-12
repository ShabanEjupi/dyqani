/**
 * Supabase Client for Browser
 * Initialize Supabase client for the frontend
 */

// Supabase configuration - these are safe to expose (anon key has RLS protection)
const SUPABASE_URL = 'https://ahjqgncpupqlbuzrpocl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoanFnbmNwdXBxbGJ1enJwb2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MjQ2NDMsImV4cCI6MjA1MzIwMDY0M30.7L9V4ZOLPsW1HNL4p2Vu3mGYFpPy82GNrW_BQKbpYhY';

// Create Supabase client using the CDN-loaded library
let supabaseClient = null;

// Initialize when the script loads
(function initSupabase() {
    // Check if Supabase is available from CDN
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
    } else {
        // Load Supabase from CDN if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = function() {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client loaded and initialized');
            // Trigger event to notify other scripts
            document.dispatchEvent(new CustomEvent('supabase-ready'));
        };
        document.head.appendChild(script);
    }
})();

// Generate unique order number
function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EC-${timestamp}-${random}`;
}

// Create order in Supabase database
async function createOrderInDatabase(orderData) {
    console.log('Creating order in Supabase...', orderData);

    if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare order object for database
    const order = {
        order_number: orderNumber,
        customer_name: orderData.customerInfo.fullname,
        customer_email: orderData.customerInfo.email,
        customer_phone: orderData.customerInfo.phone,
        customer_address: {
            street: orderData.customerInfo.address,
            city: orderData.customerInfo.city,
            postalCode: '',
            country: 'Kosovo'
        },
        items: orderData.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || ''
        })),
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping.price,
        discount: orderData.discount || 0,
        total_amount: orderData.total,
        status: 'pending',
        payment_method: orderData.paymentMethod || 'cash',
        delivery_method: orderData.shipping.method?.name || 'standard',
        notes: orderData.customerInfo.notes || '',
        pos_synced: false
    };

    try {
        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        console.log('Order created in Supabase:', data);

        // Update stock quantities for each item
        for (const item of orderData.items) {
            try {
                await supabaseClient.rpc('decrement_stock', {
                    product_id: item.id,
                    quantity: item.quantity
                });
            } catch (stockError) {
                console.warn(`Failed to update stock for ${item.name}:`, stockError);
            }
        }

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

// Get order by ID
async function getOrderById(orderId) {
    if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return data;
}

// Get order by order number
async function getOrderByNumber(orderNumber) {
    if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

    if (error) throw error;
    return data;
}

// Export functions for global access
window.SupabaseOrders = {
    createOrder: createOrderInDatabase,
    getOrderById,
    getOrderByNumber,
    generateOrderNumber
};

// Expose the client for other modules
window.getSupabaseClient = function() {
    return supabaseClient;
};
