// Main JavaScript file for the website

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle sorting products on the products page
    const sortSelect = document.getElementById('sort-products');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // Update copyright year
    updateCopyrightYear();

    // Initialize event listeners and functionality here
    const cartIcon = document.querySelector('.cart-icon');
    const productButtons = document.querySelectorAll('.add-to-cart');

    cartIcon.addEventListener('click', () => {
        // Logic to open the cart or navigate to the cart page
        window.location.href = 'pages/checkout.html';
    });

    productButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            // Logic to add the product to the cart
            addToCart(productId);
        });
    });
});

// Sort products based on selected option
function sortProducts(sortOption) {
    if (!products || products.length === 0) return;
    
    switch (sortOption) {
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Default sorting (could be by id or featured status)
            products.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    // Re-display the products
    displayProducts();
}

// Update copyright year in footer
function updateCopyrightYear() {
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace(/\d{4}/, currentYear);
    }
}

// Detect when a user has scrolled down the page
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Function to add a product to the cart
function addToCart(productId) {
    // Logic to add the product to the cart
    console.log(`Product ${productId} added to cart.`);
}