// Instagram Products Fetcher with Image Proxy

// Configuration
const config = {
    useInstagram: true,
    localProductsPath: 'data/products.json',
    imageProxyEndpoint: '/api/instagram-image-proxy'
};

// Define the products from your Instagram links
const enisiProducts = [
    {
        id: 'insta1',
        name: 'Trenerka termo për vajza',
        description: 'Mosha: 6 - 12 vjeç',
        price: 12.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/468653015_18123224347400312_2374986536723326172_n.jpg?stp=dst-jpg_e35_s640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjcxNXg3MTUuc2RyLmY3NTc2MS5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QEoYu6ujimiAl8vIrTZWW6JVyV93joQH1eqrxszRrQwX4ulRJJWJVAHrjKFRgJxHbg&_nc_ohc=sG2efIAGVIUQ7kNvwGb7Wjk&_nc_gid=vX6PzaRvDbrW1lwd5YiBKw&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzUxMjEzNzI1NDcwNTQyMzE4Nw%3D%3D.3-ccb7-5&oh=00_AfE7qvYCMHB-gZw5gYcZ2PT82U2VWmeQzB3v-VCWPVGvqA&oe=68033E4F&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DC9njmdIeNT/'
    },
    {
        id: 'insta2',
        name: 'Fustana për vajza',
        description: 'Mosha: 6 - 24 muaj',
        price: 8.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/468637252_18123225220400312_7896748840369774594_n.jpg?stp=dst-jpg_e35_s720x720_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTQ0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QGlGqm2bVks8tQ0L_eBs0MMBSjqt3nDWvYl19IFLNSQncs5ZBG6883UFNMH8AaUHx4&_nc_ohc=TfOXA8atXMQQ7kNvwHJlKWt&_nc_gid=jLoiTvLmVuGNoNMBAGQ1YA&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzUxMjE0MTMwMDQ3MzMwMjA4Mw%3D%3D.3-ccb7-5&oh=00_AfGrWvuQHrfhCRfusQ-0Gsn3jh890mxqdiVUHc9JbOIo1A&oe=68033D2C&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DC9oeeXsIxD/'
    },
    {
        id: 'insta3',
        name: 'Fustana për vajza',
        description: 'Mosha: 7 - 11 vjeç',
        price: 12.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.29350-15/470157298_1533192894036663_180335926716180664_n.heic?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjk2MHg5NjAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QFplLy09esSBO8lsOhN01YBmWNLSoAF-VzOYROEhRRurHLRBorNm9lUMI6pKn5xlE4&_nc_ohc=SmxQJcQOVhoQ7kNvwFE-U__&_nc_gid=DnM2dkLtfht8MREPu03H9w&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzUyNTAzMDcyNzA0MTI5MTM2Ng%3D%3D.3-ccb7-5&oh=00_AfG6Kws2XpRuc_1mpMA3qyhbzgvVGr7ugQBLczG3QH0uWA&oe=680339AD&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DDrbMUTohRm/'
    },
    {
        id: 'insta4',
        name: 'Bluza për vajza',
        description: 'Mosha: 9 - 12 vjeç',
        price: 5.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/472047492_18128043481400312_5177866163732224127_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjcyM3g0ODQuc2RyLmY3NTc2MS5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHGgHB-mjmo2igOPZ1auA7pyLMqAxpfByBHHX3Xjq9AlSJn970Zpxih9iPnwpuT708&_nc_ohc=TzwqE_AC2kIQ7kNvwHue09J&_nc_gid=gUa_vbxc5wNw-AxFTBnP5g&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU0NjA1NjM3NTk4NjIwODIzOQ%3D%3D.3-ccb7-5&oh=00_AfEcSp_3oNCKPwZ83PPf-3Lxq6a5HqoCL1VvAL7SEXpUxQ&oe=68033C94&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DE2H4BGqEy9/'
    },
    {
        id: 'insta5',
        name: 'Bluza për djem',
        description: 'Mosha: 9 - 12 vjeç',
        price: 5.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/471754915_18128043856400312_2992821411035262859_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjExMjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHdQHSZg6bU2DNRjWu-lTBQetosNqzuVwk5jb_PTu49CfUfxYA3wPXe5A-Yzci4yRs&_nc_ohc=hRYzuI0WVg8Q7kNvwH_FAwi&_nc_gid=YiJ7hAWiqFMQEAuMQU9EUQ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU0NjA1ODkzMDc1MzYyMzUwNw%3D%3D.3-ccb7-5&oh=00_AfFCJrE8aUaeqP6HsG-bqgbxtfGP1SF2mOBrPI_Ze8cjtw&oe=68033ACE&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DE2IdJ5qub5/'
    },
    {
        id: 'insta6',
        name: 'Trenerka të poshtme për djem',
        description: 'Mosha: 8 - 16 vjeç',
        price: 5.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/471744620_18128044786400312_8346093827122126_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjU5Mng3NDAuc2RyLmY3NTc2MS5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QH1KcJt0aXCwIfL_oW3RzCxM9lXrjebSaVZwZjjwEjXWr7AwCzR0rTA4kgtvVvy7Kc&_nc_ohc=Pv1XG_WzIosQ7kNvwEHYVa7&_nc_gid=mUDKBuLf0x1BBXEPP7eOTQ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU0NjA2NDgxODEyMTkxNjkyMw%3D%3D.3-ccb7-5&oh=00_AfHUOWvady2O3sUMMjnLAVpz5nj3VY3OYzuDm0-9EoIyBQ&oe=680360BB&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DE2Jy0NKbLi/'
    },
    {
        id: 'insta7',
        name: 'Trenerka set për djem',
        description: 'Mosha: 8 - 16 vjeç',
        price: 12.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/472646561_18128045023400312_8245777691868293454_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjg1MngxMDY1LnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHgKnZ3roxmpKg2Rs5iJv_wnCICAULlxOpM5ZWi3_dfEoQW9209my9u_G1Ndp-x_lc&_nc_ohc=mkE5SW0ZUTQQ7kNvwEWNv-4&_nc_gid=9xOzufc_eo7ZexGl4Inyeg&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU0NjA2NjExOTQ1NDk3MDE1Nw%3D%3D.3-ccb7-5&oh=00_AfEmIaIISScuohtsQUB6fdO5CthEbo-i8cZHhTWmkRsqgQ&oe=68032A0A&_nc_sid=10d13b',
        instagramLink: 'https://www.instagram.com/p/DE2KF1RK7yK/'
    },
    {
        id: 'insta8',
        name: 'Set 3-pjesësh për vajza',
        description: 'Mosha: 6 - 24 muaj',
        price: 10.00,
        image: 'https://instagram.fprn12-1.fna.fbcdn.net/v/t51.2885-15/468449599_18123221773400312_7424695642133080002_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjEzMTl4MTU1NC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fprn12-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFWOFbHv_BbIxy19nb7nz51Upl3zcEzNj73fYFkxdJSYlpr3zx7JGBV3y5d8aAPazQ&_nc_ohc=Cnuy6d8-pq4Q7kNvwFseHgE&_nc_gid=A9OwBOELaqY5KN89JHxPXA&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzUxMjEyMzg5ODcxNjA3MjYxMw%3D%3D.3-ccb7-5&oh=00_AfF2wCHvuoH0pYUeXteLFYqO1iceoyX1MbxmxqfYYQlLlg&oe=68032BE9&_nc_sid=10d13b',
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
    
    // Only display up to 4 products on the homepage
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/Store/');
                        
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
    
    // Try to get the image from our cache first
    if (product.instagramLink && window.getInstagramImage) {
        const cachedImage = window.getInstagramImage(product.instagramLink);
        if (cachedImage) {
            // Set image and add a timestamp to prevent caching issues
            productImage.src = cachedImage + "?t=" + new Date().getTime();
        } else {
            // Use a simpler fallback URL if needed
            productImage.src = getSimpleProductImage(product.id) || product.image;
        }
    } else {
        productImage.src = getSimpleProductImage(product.id) || product.image;
    }
    
    productImage.alt = product.name;
    productImage.onerror = function() {
        this.src = getSimpleProductImage(product.id) || 'https://via.placeholder.com/300x300?text=Pa+Foto';
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

// Add a simple function to provide direct image URLs by product ID
function getSimpleProductImage(productId) {
    const imageMap = {
        'insta1': 'https://i.imgur.com/v9YYyPP.jpg', // Trenerka termo për vajza
        'insta2': 'https://i.imgur.com/QTFCNuq.jpg', // Fustana për vajza
        'insta3': 'https://i.imgur.com/8bvSnXk.jpg', // Fustana për vajza
        'insta4': 'https://i.imgur.com/h5rQ0NF.jpg', // Bluza për vajza
        'insta5': 'https://i.imgur.com/PCmnb80.jpg', // Bluza për djem
        'insta6': 'https://i.imgur.com/LZfCVvn.jpg', // Trenerka të poshtme për djem
        'insta7': 'https://i.imgur.com/yJpXeuo.jpg', // Trenerka set për djem
        'insta8': 'https://i.imgur.com/j4YoS9K.jpg'  // Set 3-pjesësh për vajza
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

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    debugImageCache();
    // Rest of your initialization code
});