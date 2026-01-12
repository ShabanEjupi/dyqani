/**
 * Supabase Client for Browser
 * Initialize Supabase client for the frontend
 */

// Supabase configuration - these are safe to expose (anon key has RLS protection)
const SUPABASE_URL = 'https://eimquqgpznhticgfsysz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbXF1cWdwem5odGljZ2ZzeXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxODgzNTUsImV4cCI6MjA4Mzc2NDM1NX0.0vu1z8qTytrV2zxIn2fkxb88XETUwVWYbkKR1sk54g0';

// Create Supabase client using the CDN-loaded library
let supabaseClient = null;
let supabaseReady = false;

// Initialize when the script loads
function initSupabase() {
    // Check if Supabase is available from CDN
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabaseReady = true;
        console.log('Supabase client initialized successfully');
        // Trigger event to notify other scripts
        document.dispatchEvent(new CustomEvent('supabase-ready'));
    } else {
        console.log('Supabase not loaded yet, waiting...');
        // Try again after a short delay
        setTimeout(initSupabase, 100);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

// Generate unique order number
function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EC-${timestamp}-${random}`;
}

// Wait for Supabase to be ready
function waitForSupabase(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (supabaseClient && supabaseReady) {
            resolve(supabaseClient);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (supabaseClient && supabaseReady) {
                clearInterval(checkInterval);
                resolve(supabaseClient);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Supabase client initialization timeout'));
            }
        }, 100);
    });
}

// Create order in Supabase database
async function createOrderInDatabase(orderData) {
    console.log('Creating order in Supabase...', orderData);

    try {
        // Wait for Supabase to be ready
        await waitForSupabase();
        
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

        console.log('Order object to insert:', order);

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

        // Update stock quantities for each item (optional, may fail silently)
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
        // Return a failed result but don't throw - order can still proceed without database
        return {
            success: false,
            error: error.message,
            orderNumber: generateOrderNumber() // Generate a local order number for reference
        };
    }
}

// Get order by ID
async function getOrderById(orderId) {
    try {
        await waitForSupabase();
        
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting order by ID:', error);
        throw error;
    }
}

// Get order by order number
async function getOrderByNumber(orderNumber) {
    try {
        await waitForSupabase();
        
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting order by number:', error);
        throw error;
    }
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
