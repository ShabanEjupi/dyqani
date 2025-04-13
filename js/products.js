// Instagram Products Fetcher

// Configuration
const config = {
    useInstagram: true, // Set to false to use local products instead
    instagram: {
        username: 'enisi.center',
        // In a real implementation, you'd need to set up proper Instagram API access
        // This would require creating a Facebook Developer account and getting API tokens
        accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN' // Replace with your actual token
    },
    localProductsPath: 'data/products.json'
};

// Global products array
let products = [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const productList = document.getElementById('product-list');
    const loadingElement = document.getElementById('loading-products');
    
    // Initialize products
    loadProducts();
    
    // Update cart count on page load
    updateCartCount();
});

// Load products either from Instagram or local JSON
async function loadProducts() {
    try {
        if (config.useInstagram) {
            products = await fetchInstagramProducts();
        } else {
            products = await fetchLocalProducts();
        }
        
        displayProducts();
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Nuk u arrit të ngarkoheshin produktet. Duke përdorur produktet lokale.');
        
        // Fallback to local products
        try {
            products = await fetchLocalProducts();
            displayProducts();
        } catch (secondError) {
            showError('Nuk u arrit të ngarkoheshin as produktet lokale.');
        }
        
        hideLoading();
    }
}

// Fetch products from Instagram
async function fetchInstagramProducts() {
    // NOTE: This is a simplified example. In reality, working with Instagram API is more complex
    // and requires proper authentication setup.
    
    // Placeholder for Instagram API call
    // In a real implementation, you'd use the Instagram Graph API
    
    try {
        // This would be replaced with an actual API call
        // const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${config.instagram.accessToken}`);
        // const data = await response.json();
        
        // For demo purposes, we'll return placeholder data
        return [
            {
                id: 'insta1',
                name: 'Produkt nga Instagram 1',
                description: 'Përshkrimi i produktit nga Instagram',
                price: 25.99,
                image: 'https://via.placeholder.com/300x300?text=Instagram+Produkt+1',
                instagramLink: 'https://instagram.com/p/example1'
            },
            {
                id: 'insta2',
                name: 'Produkt nga Instagram 2',
                description: 'Produkt tjetër nga Instagram',
                price: 34.50,
                image: 'https://via.placeholder.com/300x300?text=Instagram+Produkt+2',
                instagramLink: 'https://instagram.com/p/example2'
            },
            // Add more placeholder products here
        ];
    } catch (error) {
        console.error('Error fetching from Instagram:', error);
        throw error;
    }
}

// Fetch products from local JSON file
async function fetchLocalProducts() {
    try {
        const response = await fetch(config.localProductsPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching local products:', error);
        
        // Return some default products if local file doesn't exist
        return [
            {
                id: 'prod1',
                name: 'Produkt 1',
                description: 'Përshkrimi i produktit të parë',
                price: 19.99,
                image: 'https://via.placeholder.com/300x300?text=Produkt+1'
            },
            {
                id: 'prod2',
                name: 'Produkt 2',
                description: 'Përshkrimi i produktit të dytë',
                price: 29.99,
                image: 'https://via.placeholder.com/300x300?text=Produkt+2'
            },
            {
                id: 'prod3',
                name: 'Produkt 3',
                description: 'Përshkrimi i produktit të tretë',
                price: 39.99,
                image: 'https://via.placeholder.com/300x300?text=Produkt+3'
            }
        ];
    }
}

// Display products in the product list
function displayProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Clear existing products
    productList.innerHTML = '';
    
    // Only display up to 4 products on the homepage
    const displayProducts = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname === '/Store/' ? 
                           products.slice(0, 4) : products;
    
    // Create product elements
    displayProducts.forEach(product => {
        const productElement = createProductElement(product);
        productList.appendChild(productElement);
    });
}

// Create a product element
function createProductElement(product) {
    const productElement = document.createElement('div');
    productElement.className = 'product-card';
    productElement.dataset.productId = product.id;
    
    const productImage = document.createElement('img');
    productImage.src = product.image;
    productImage.alt = product.name;
    productImage.onerror = function() {
        this.src = 'https://via.placeholder.com/300x300?text=Pa+Foto';
    };
    
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';
    
    const productName = document.createElement('h3');
    productName.textContent = product.name;
    
    const productDescription = document.createElement('p');
    productDescription.className = 'product-description';
    productDescription.textContent = product.description;
    
    const productPrice = document.createElement('p');
    productPrice.className = 'product-price';
    productPrice.textContent = `${product.price.toFixed(2)} LEK`;
    
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn add-to-cart';
    addToCartBtn.textContent = 'Shto në shportë';
    addToCartBtn.onclick = function() {
        addToCart(product);
    };
    
    // If from Instagram, add Instagram link
    if (product.instagramLink) {
        const instagramLink = document.createElement('a');
        instagramLink.href = product.instagramLink;
        instagramLink.className = 'instagram-link';
        instagramLink.target = '_blank';
        instagramLink.innerHTML = '<i class="fab fa-instagram"></i> Shiko në Instagram';
        productInfo.appendChild(instagramLink);
    }
    
    productInfo.appendChild(productName);
    productInfo.appendChild(productDescription);
    productInfo.appendChild(productPrice);
    productInfo.appendChild(addToCartBtn);
    
    productElement.appendChild(productImage);
    productElement.appendChild(productInfo);
    
    return productElement;
}

// Show/hide loading indicator
function hideLoading() {
    const loadingElement = document.getElementById('loading-products');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function showLoading() {
    const loadingElement = document.getElementById('loading-products');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

// Show error message
function showError(message) {
    const productList = document.getElementById('product-list');
    if (productList) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        productList.appendChild(errorElement);
    }
}

// Add product to cart
function addToCart(product) {
    // Logic to add the product to the cart
    console.log(`Product ${product.id} added to cart`);
}