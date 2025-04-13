// Instagram Products Fetcher - Updated for Instagram Graph API

// Configuration
const config = {
    useInstagram: true,
    localProductsPath: 'data/products.json'
};

// Define the products from your Instagram links
const enisiProducts = [
    {
        id: 'insta1',
        name: 'Dhurata për femra',
        description: 'Set dhuratash elegant për femra',
        price: 15.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/432619302_122132594209257416_9132967593412667683_n.jpg?stp=dst-jpg_p1080x2048&_nc_cat=105&ccb=1-7&_nc_sid=3635dc&_nc_ohc=IR6336L6Xl8AX9XTAW7&_nc_ht=scontent.xx&oh=00_AfCvcg1NG-BAWwrLm2f_FDmDFTaQN-d5qNxJY6zKYynEsg&oe=660FF795',
        instagramLink: 'https://www.instagram.com/p/DC9njmdIeNT/'
    },
    {
        id: 'insta2',
        name: 'Vazo dhe lule artificiale',
        description: 'Vazo dekorative me lule artificiale',
        price: 25.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/432427786_122132602914357416_9043348931282074934_n.jpg?stp=dst-jpg_p720x720&_nc_cat=111&ccb=1-7&_nc_sid=3635dc&_nc_ohc=Znvo0F7CcFQAX-OTzZn&_nc_ht=scontent.xx&oh=00_AfCQIWTS-gC5YR8F4xCblafPso5qr-KXWZuhpvb9Dalm-Q&oe=660FD450',
        instagramLink: 'https://www.instagram.com/p/DC9oeeXsIxD/'
    },
    {
        id: 'insta3',
        name: 'Set për banim',
        description: 'Set dekorativ modern për banesë',
        price: 49.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/436879257_122132599755557416_3234135770201719232_n.jpg?stp=dst-jpg_p720x720&_nc_cat=104&ccb=1-7&_nc_sid=3635dc&_nc_ohc=JXR0COF5clUAX80L051&_nc_ht=scontent.xx&oh=00_AfCcriF1WCpEUjq81RHbLEt5yLIy87rLYoDktqyiLvCd3w&oe=660E96D3',
        instagramLink: 'https://www.instagram.com/p/DDrbMUTohRm/'
    },
    {
        id: 'insta4',
        name: 'Aksesorë për shtëpi',
        description: 'Pajisje dhe dekorime të ndryshme për shtëpi',
        price: 18.50,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/439647599_122132773871257416_4984890609171797155_n.jpg?stp=dst-jpg_p720x720&_nc_cat=108&ccb=1-7&_nc_sid=3635dc&_nc_ohc=yWnCsVEapxgAX_59l1Z&_nc_ht=scontent.xx&oh=00_AfBs53gZToeCyfC5jCgkRzfpnHWpMRHyffyRugABJGFuQg&oe=660EBE09',
        instagramLink: 'https://www.instagram.com/p/DE2H4BGqEy9/'
    },
    {
        id: 'insta5',
        name: 'Set dekorimi',
        description: 'Set i plotë për dekorim të ambienteve',
        price: 35.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/439607129_122132776759357416_6685974088155811121_n.jpg?stp=dst-jpg_p720x720&_nc_cat=105&ccb=1-7&_nc_sid=3635dc&_nc_ohc=nb2Camrew9AAX-FDNwy&_nc_ht=scontent.xx&oh=00_AfAguFC9gALsbtqXJ3rXxNKvaVaXyBntXFiPyglFvyexug&oe=660FE0C1',
        instagramLink: 'https://www.instagram.com/p/DE2IdJ5qub5/'
    },
    {
        id: 'insta6',
        name: 'Çanta elegante',
        description: 'Çanta cilësore me dizajn elegant për femra',
        price: 40.00,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/439607114_122132779496257416_8451287197382423138_n.jpg?stp=dst-jpg_p720x720&_nc_cat=110&ccb=1-7&_nc_sid=3635dc&_nc_ohc=ft8zO68cXPsAX8kMjRS&_nc_ht=scontent.xx&oh=00_AfDlt7QbjomM6gJG5d7JwEf07QitwrDJuxakXmCQTBpnAA&oe=660F8D52',
        instagramLink: 'https://www.instagram.com/p/DE2Jy0NKbLi/'
    },
    {
        id: 'insta7',
        name: 'Telefon mbajtës',
        description: 'Mbajtës elegante për telefonin tuaj',
        price: 12.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/439679961_122132785160357416_7815203774037290097_n.jpg?stp=dst-jpg_p720x720&_nc_cat=103&ccb=1-7&_nc_sid=3635dc&_nc_ohc=dl1l2QXdYWkAX95X46G&_nc_ht=scontent.xx&oh=00_AfDIHX-RGb_Nbv5GFcfUbZlONH982Wld92QlsXU5KPxfKA&oe=660FBC10',
        instagramLink: 'https://www.instagram.com/p/DE2KF1RK7yK/'
    },
    {
        id: 'insta8',
        name: 'Set dhuratash',
        description: 'Set i përsosur dhuratash për çdo rast',
        price: 29.99,
        image: 'https://scontent.xx.fbcdn.net/v/t39.30808-6/431891675_122132640393357416_7074018585134061418_n.jpg?stp=dst-jpg_p720x720&_nc_cat=107&ccb=1-7&_nc_sid=3635dc&_nc_ohc=oO_G2JPePHsAX8NWlgr&_nc_ht=scontent.xx&oh=00_AfBeXQys0EexDi-_IbI5O4RU4Fhwogtt06u_w2Hnvh3IMg&oe=660F2CEA',
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
        
        displayProducts();
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Nuk u arrit të ngarkoheshin produktet. Duke përdorur produktet nga Instagram.');
        
        // Fallback to predefined products
        products = enisiProducts;
        displayProducts();
        hideLoading();
    }
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