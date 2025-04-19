// Instagram Products Fetcher with Image Proxy

// Configuration
const config = {
    useInstagram: true,
    imageProxyEndpoint: '/api/instagram-image-proxy'
};

// Define the products from your Instagram links
const enisiProducts = [
    {
        id: 'insta1',
        name: 'Trenerka termo për vajza',
        description: 'Mosha: 6 - 12 vjeç',
        price: 12.00,
        image: '../assets/icons/product1.png',
        instagramLink: 'https://www.instagram.com/p/DC9njmdIeNT/'
    },
    {
        id: 'insta2',
        name: 'Fustana për vajza',
        description: 'Mosha: 6 - 24 muaj',
        price: 8.00,
        image: '../assets/icons/product2.png',
        instagramLink: 'https://www.instagram.com/p/DC9oeeXsIxD/'
    },
    {
        id: 'insta3',
        name: 'Fustana për vajza',
        description: 'Mosha: 7 - 11 vjeç',
        price: 12.00,
        image: '../assets/icons/product3.png',
        instagramLink: 'https://www.instagram.com/p/DDrbMUTohRm/'
    },
    {
        id: 'insta4',
        name: 'Bluza për vajza',
        description: 'Mosha: 9 - 12 vjeç',
        price: 5.00,
        image: '../assets/icons/product4.png',
        instagramLink: 'https://www.instagram.com/p/DE2H4BGqEy9/'
    },
    {
        id: 'insta5',
        name: 'Bluza për djem',
        description: 'Mosha: 9 - 12 vjeç',
        price: 5.00,
        image: '../assets/icons/product5.png',
        instagramLink: 'https://www.instagram.com/p/DE2IdJ5qub5/'
    },
    {
        id: 'insta6',
        name: 'Trenerka të poshtme për djem',
        description: 'Mosha: 8 - 16 vjeç',
        price: 5.00,
        image: '../assets/icons/product6.png',
        instagramLink: 'https://www.instagram.com/p/DE2Jy0NKbLi/'
    },
    {
        id: 'insta7',
        name: 'Trenerka set për djem',
        description: 'Mosha: 8 - 16 vjeç',
        price: 12.00,
        image: '../assets/icons/product7.png',
        instagramLink: 'https://www.instagram.com/p/DE2KF1RK7yK/'
    },
    {
        id: 'insta8',
        name: 'Set 3-pjesësh për vajza',
        description: 'Mosha: 6 - 24 muaj',
        price: 10.00,
        image: '../assets/icons/product8.png',
        instagramLink: 'https://www.instagram.com/p/DC9khPuIaql/'
    }
];

// Global products array
let products = [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const productList = document.getElementById('product-list');
    const loadingElement = document.getElementById('loading-products');
    
    // Initialize products
    loadProducts();
    
    // Update cart count on page load
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// Load products either from Instagram or local JSON
async function loadProducts() {
    try {
        if (config.useInstagram && window.instagramApi) {
            // Use the new Instagram Graph API integration
            products = await window.instagramApi.fetchMedia();
        } else {
            products = await fetchLocalProducts();
        }
        
        // Ensure all products have permanent image URLs
        await ensurePermanentImageUrls(products);
        
        displayProducts();
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Nuk u arrit të ngarkoheshin produktet. Duke përdorur produktet nga Instagram.');
        
        // Fallback to predefined products
        products = enisiProducts;
        await ensurePermanentImageUrls(products);
        displayProducts();
        hideLoading();
    }
}

// Ensure all products have permanent image URLs
async function ensurePermanentImageUrls(productsList) {
    const productsWithImages = await Promise.all(
        productsList.map(async product => {
            if (product.instagramLink) {
                try {
                    // Use the image proxy to get a permanent URL
                    const proxyUrl = `${config.imageProxyEndpoint}?url=${encodeURIComponent(product.instagramLink)}`;
                    const response = await fetch(proxyUrl);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.imageUrl) {
                            // Update the product image URL
                            return {
                                ...product,
                                image: data.imageUrl
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Failed to fetch permanent image for ${product.name}:`, error);
                }
            }
            
            // If anything fails, return the original product
            return product;
        })
    );
    
    // Replace the products array with the updated one
    return productsWithImages;
}

// Fetch products from local JSON file as fallback
async function fetchLocalProducts() {
    try {
        const response = await fetch(config.localProductsPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching local products:', error);
        return enisiProducts; // Fallback to our predefined products
    }
}

// Display products in the product list
function displayProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Clear existing products
    productList.innerHTML = '';
    
    // More robust homepage detection
    const path = window.location.pathname.toLowerCase();
    const isHomePage = path.endsWith('index.html') || 
                       path === '/' || 
                       path.endsWith('/store/') ||
                       path.endsWith('/store') ||
                       path === '';
    
    console.log("Current path:", path, "Is homepage:", isHomePage);
    
    // Always show the first 4 products on homepage
    const displayProducts = isHomePage ? products.slice(0, 4) : products;
    
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
    
    // Use Imgur images directly for better reliability
    const imgurImage = getSimpleProductImage(product.id);
    if (imgurImage) {
        productImage.src = imgurImage;
    } else if (product.instagramLink && window.getInstagramImage) {
        const cachedImage = window.getInstagramImage(product.instagramLink);
        if (cachedImage) {
            productImage.src = cachedImage;
        } else {
            productImage.src = product.image;
        }
    } else {
        productImage.src = product.image;
    }
    
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
    productPrice.textContent = `${product.price.toFixed(2)} €`;
    
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn add-to-cart';
    addToCartBtn.textContent = 'Shto në shportë';
    addToCartBtn.onclick = function() {
        if (typeof addToCart === 'function') {
            addToCart(product);
        } else {
            console.error('addToCart function not available');
        }
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

// Update the getSimpleProductImage function to handle the new directory structure
function getSimpleProductImage(productId) {
    // Everything is now in the pages directory, so always use the same path
    const basePath = '../assets/icons/';
    
    const imageMap = {
        'insta1': basePath + 'product1.png',
        'insta2': basePath + 'product2.png',
        'insta3': basePath + 'product3.png',
        'insta4': basePath + 'product4.png',
        'insta5': basePath + 'product5.png',
        'insta6': basePath + 'product6.png',
        'insta7': basePath + 'product7.png',
        'insta8': basePath + 'product8.png'
    };
    
    return imageMap[productId];
}

// Directly fetch Instagram image URL as fallback
async function fetchInstagramImageDirectly(instagramUrl) {
    // This is a client-side fallback when the Netlify function fails
    try {
        // Use a CORS proxy service (you might need to replace this with a reliable one)
        const corsProxy = 'https://corsproxy.io/?';
        const response = await fetch(corsProxy + encodeURIComponent(instagramUrl));
        const html = await response.text();
        
        // Extract image URL from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const metaTag = doc.querySelector('meta[property="og:image"]');
        
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching Instagram image directly:', error);
        return null;
    }
}

// Show loading overlay with message
function showLoading(message) {
    // Remove any existing overlay
    hideLoading();
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <p>${message || 'Duke u ngarkuar...'}</p>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
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

// Debug function to check image loading
function debugImageCache() {
    console.log("Instagram Image Cache Available:", !!window.getInstagramImage);
    if (window.getInstagramImage) {
        enisiProducts.forEach(product => {
            const cachedUrl = window.getInstagramImage(product.instagramLink);
            console.log(`Product ${product.id} (${product.name}): ${cachedUrl ? "Has cached image" : "No cached image"}`);
            
            // Try to preload the image to check if it works
            if (cachedUrl) {
                const img = new Image();
                img.onload = () => console.log(`Image for ${product.id} loaded successfully`);
                img.onerror = () => console.error(`Image for ${product.id} failed to load`);
                img.src = cachedUrl;
            }
        });
    }
}