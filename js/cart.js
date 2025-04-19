// Cart functionality with PayPal integration

// Initialize cart from localStorage or as empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add to cart function
function addToCart(product) {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    
    // Show confirmation
    showNotification('Produkti u shtua në shportë!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    updateCartCount();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            removeFromCart(productId);
            return;
        }
    }
    
    saveCart();
    updateCartUI();
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in the header
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Update the cart UI on the checkout page
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    // Clear existing cart items
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Shporta juaj është bosh</p>';
        if (cartSummary) {
            cartSummary.innerHTML = '';
        }
        return;
    }
    
    // Add each cart item to the container
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.productId = item.id;
        
        // Create item content
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100?text=Pa+Foto'">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-price">${item.price.toFixed(2)} €</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease">-</button>
                <input type="number" min="1" value="${item.quantity}" class="quantity-input">
                <button class="quantity-btn increase">+</button>
            </div>
            <div class="cart-item-total">
                ${(item.price * item.quantity).toFixed(2)} €
            </div>
            <button class="remove-item">×</button>
        `;
        
        cartContainer.appendChild(cartItem);
        
        // Add event listeners
        const decreaseBtn = cartItem.querySelector('.decrease');
        const increaseBtn = cartItem.querySelector('.increase');
        const quantityInput = cartItem.querySelector('.quantity-input');
        const removeBtn = cartItem.querySelector('.remove-item');
        
        decreaseBtn.addEventListener('click', () => {
            updateQuantity(item.id, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            updateQuantity(item.id, item.quantity + 1);
        });
        
        quantityInput.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity)) {
                updateQuantity(item.id, newQuantity);
            }
        });
        
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
        });
    });
    
    // Update cart summary
    if (cartSummary) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 2.00 : 0; // 2€ shipping instead of 5€
        const total = subtotal + shipping;
        
        cartSummary.innerHTML = `
            <div class="summary-item">
                <span>Nëntotali:</span>
                <span>${subtotal.toFixed(2)} €</span>
            </div>
            <div class="summary-item">
                <span>Transporti:</span>
                <span>${shipping.toFixed(2)} €</span>
            </div>
            <div class="summary-item total">
                <span>Totali:</span>
                <span>${total.toFixed(2)} €</span>
            </div>
            <button id="checkout-button" class="btn btn-primary">Vazhdo me porosinë</button>
        `;
        
        // Add checkout button event
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', processCheckout);
        }
    }
}

// Process checkout
function processCheckout() {
    // Here you would typically integrate with a payment gateway
    // For demo purposes, we'll just show a success message
    
    // Get customer info from form
    const customerForm = document.getElementById('customer-info-form');
    
    if (customerForm && customerForm.checkValidity()) {
        // Generate order summary for PayPal reference
        const orderSummary = generateOrderSummary();
        
        // Show success message with PayPal option
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `
            <div class="checkout-success">
                <i class="fas fa-check-circle"></i>
                <h2>Faleminderit për porosinë tuaj!</h2>
                <p>Porosia juaj u pranua me sukses.</p>
                <p>Një email konfirmimi do t'ju dërgohet së shpejti.</p>
                
                <div class="payment-instructions">
                    <h3>Udhëzime për pagesë:</h3>
                    <p>Ju lutemi zgjidhni një nga metodat e mëposhtme të pagesës:</p>
                    
                    <div class="payment-methods checkout-methods">
                        <div class="payment-method-details">
                            <h4><i class="fas fa-money-bill-wave"></i> Pagesë me para në dorë</h4>
                            <p>Paguani kur të merrni produktin.</p>
                        </div>
                        
                        <div class="payment-method-details">
                            <h4><i class="fab fa-paypal"></i> Pagesë përmes PayPal</h4>
                            <p>Transferoni pagesën në llogarinë tonë PayPal duke përdorur detajet e mëposhtme:</p>
                            <p><strong>PayPal:</strong> <a href="https://www.paypal.com/paypalme/shabanejupi5" target="_blank">paypal.me/shabanejupi5</a></p>
                            <p><strong>Shuma:</strong> ${orderSummary.total.toFixed(2)} €</p>
                            <p><strong>Referenca:</strong> Porosia #${orderSummary.orderId}</p>
                            <a href="https://www.paypal.com/paypalme/shabanejupi5" target="_blank" class="btn btn-paypal">
                                Paguaj me PayPal <i class="fab fa-paypal"></i>
                            </a>
                        </div>
                    </div>
                </div>
                
                <a href="../pages/products.html" class="btn">Vazhdoni blerjet</a>
            </div>
        `;
        
        // Clear cart after successful order
        cart = [];
        saveCart();
        updateCartCount();
        
    } else if (customerForm) {
        // Trigger HTML5 validation
        customerForm.reportValidity();
    }
}

// Generate order summary
function generateOrderSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 2.00 : 0; // 2€ shipping instead of 5€
    const total = subtotal + shipping;
    
    // Generate a simple order ID
    const orderId = 'EC' + Date.now().toString().slice(-8);
    
    return {
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        orderId: orderId,
        date: new Date().toISOString()
    };
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize cart UI when on checkout page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        updateCartUI();
    }
    
    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Faleminderit që u abonuat!');
            this.reset();
        });
    }
});