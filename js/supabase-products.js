/**
 * Supabase Real-time Products Integration
 * Replaces Instagram API with Supabase database
 * Provides real-time sync with ASP.NET POS system
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Global products state
let products = [];
let realtimeSubscription = null;

// Initialize products system
export async function initializeProducts() {
  console.log('Initializing Supabase real-time products...');
  
  try {
    // Load initial products
    await loadProductsFromSupabase();
    
    // Subscribe to real-time updates
    subscribeToProductUpdates();
    
    return products;
  } catch (error) {
    console.error('Failed to initialize products:', error);
    throw error;
  }
}

// Load products from Supabase
export async function loadProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    products = data.map(product => ({
      id: product.id,
      pos_sync_id: product.pos_sync_id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image_url || '../assets/icons/placeholder.png',
      category: product.category,
      stock: product.stock_quantity,
      instagramLink: product.instagram_link,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    console.log(`Loaded ${products.length} products from Supabase`);
    return products;
  } catch (error) {
    console.error('Error loading products from Supabase:', error);
    throw error;
  }
}

// Subscribe to real-time product updates
export function subscribeToProductUpdates() {
  // Clean up existing subscription
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }

  // Create new subscription
  realtimeSubscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        console.log('Real-time product update:', payload);
        handleProductUpdate(payload);
      }
    )
    .subscribe((status) => {
      console.log('Real-time subscription status:', status);
    });

  console.log('Subscribed to real-time product updates');
}

// Handle real-time product updates
function handleProductUpdate(payload) {
  const { eventType, new: newProduct, old: oldProduct } = payload;

  switch (eventType) {
    case 'INSERT':
      handleProductInsert(newProduct);
      break;
    case 'UPDATE':
      handleProductModify(newProduct);
      break;
    case 'DELETE':
      handleProductRemove(oldProduct);
      break;
  }
}

// Handle product insert
function handleProductInsert(product) {
  const newProduct = {
    id: product.id,
    pos_sync_id: product.pos_sync_id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    image: product.image_url || '../assets/icons/placeholder.png',
    category: product.category,
    stock: product.stock_quantity,
    instagramLink: product.instagram_link,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };

  // Only add if active
  if (newProduct.isActive) {
    products.unshift(newProduct);
    
    // Trigger UI update
    if (typeof window.displayProducts === 'function') {
      window.displayProducts();
    }
    
    // Show notification
    showNotification(`New product added: ${newProduct.name}`, 'success');
  }
}

// Handle product modification
function handleProductModify(product) {
  const index = products.findIndex(p => p.id === product.id);
  
  if (index !== -1) {
    const updatedProduct = {
      id: product.id,
      pos_sync_id: product.pos_sync_id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image_url || '../assets/icons/placeholder.png',
      category: product.category,
      stock: product.stock_quantity,
      instagramLink: product.instagram_link,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    if (updatedProduct.isActive) {
      products[index] = updatedProduct;
    } else {
      // Remove if deactivated
      products.splice(index, 1);
    }
    
    // Trigger UI update
    if (typeof window.displayProducts === 'function') {
      window.displayProducts();
    }
    
    // Show notification
    showNotification(`Product updated: ${updatedProduct.name}`, 'info');
  }
}

// Handle product removal
function handleProductRemove(product) {
  const index = products.findIndex(p => p.id === product.id);
  
  if (index !== -1) {
    const removedProduct = products[index];
    products.splice(index, 1);
    
    // Trigger UI update
    if (typeof window.displayProducts === 'function') {
      window.displayProducts();
    }
    
    // Show notification
    showNotification(`Product removed: ${removedProduct.name}`, 'warning');
  }
}

// Get all products
export function getProducts() {
  return products;
}

// Get product by ID
export function getProductById(id) {
  return products.find(p => p.id === id);
}

// Search products
export function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
}

// Filter products by category
export function filterProductsByCategory(category) {
  if (!category || category === 'all') {
    return products;
  }
  return products.filter(product => product.category === category);
}

// Get unique categories
export function getCategories() {
  const categories = [...new Set(products.map(p => p.category))];
  return categories.sort();
}

// Manual sync from POS
export async function syncFromPOS() {
  try {
    showNotification('Syncing with POS system...', 'info');
    
    const response = await fetch('/.netlify/functions/sync-pos-products', {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      await loadProductsFromSupabase();
      showNotification(`Sync complete: ${result.synced} products updated`, 'success');
      
      // Trigger UI update
      if (typeof window.displayProducts === 'function') {
        window.displayProducts();
      }
    } else {
      throw new Error(result.message || 'Sync failed');
    }
  } catch (error) {
    console.error('POS sync error:', error);
    showNotification('Failed to sync with POS', 'error');
  }
}

// Show notification helper
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // If a notification system exists, use it
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
}

// Cleanup subscription on page unload
window.addEventListener('beforeunload', () => {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }
});

// Export for global access
window.supabaseProducts = {
  initializeProducts,
  loadProductsFromSupabase,
  getProducts,
  getProductById,
  searchProducts,
  filterProductsByCategory,
  getCategories,
  syncFromPOS
};
