console.log("Checkout.js loading...");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Check if styles are loaded
    const styles = document.styleSheets;
    console.log("Loaded stylesheets:", styles.length);
    for(let i = 0; i < styles.length; i++) {
        try {
            console.log(`Style ${i}:`, styles[i].href);
        } catch (e) {
            console.log(`Style ${i}: [Cannot access href]`);
        }
    }
    
    // Check cart contents
    console.log("Cart contents:", JSON.parse(localStorage.getItem('cart') || '[]'));
});

/**
 * Checkout Page Functionality
 * Manages the multi-step checkout process, order submission, and payment options
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to load before initializing
    let componentsLoaded = 0;
    
    document.addEventListener('component-loaded', function(e) {
        componentsLoaded++;
        // Once both header and footer are loaded
        if (componentsLoaded >= 2) {
            initCheckoutPage();
        }
    });
    
    // Fallback if components don't load within 1 second
    setTimeout(() => {
        initCheckoutPage();
    }, 1000);
});

function initCheckoutPage() {
    // Initialize checkout step functionality
    initCheckoutSteps();
    
    // Initialize recommendation products
    loadRecommendedProducts();
    
    // Initialize coupon code handling
    initCouponCode();
    
    // Initialize delivery option handlers
    initDeliveryOptions();
    
    // Initialize account creation toggling
    initAccountCreation();
    
    // Initialize step summaries
    updateOrderSummaries();
    
    // Initialize invoice download
    initInvoiceDownload();
    
    // Initialize PayPal checkout
    initPayPalCheckout();
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Initialize multi-step checkout process
function initCheckoutSteps() {
    // Step navigation buttons
    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const nextToStep4 = document.getElementById('next-to-step-4');
    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    
    // Step elements
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const step3 = document.getElementById('checkout-step-3');
    const step4 = document.getElementById('checkout-step-4');
    
    // Progress indicators
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Forward navigation
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            // Only proceed if cart is not empty
            if (cart.length === 0) {
                showNotification('Shporta është bosh! Ju lutemi shtoni produkte para se të vazhdoni.');
                return;
            }
            
            goToStep(2);
        });
    }
    
    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            // Validate customer info form
            const customerForm = document.getElementById('customer-info-form');
            if (customerForm && !customerForm.checkValidity()) {
                // Trigger HTML5 validation
                customerForm.reportValidity();
                return;
            }
            
            // Check password match if account is being created
            if (document.getElementById('create-account').checked) {
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (password !== confirmPassword) {
                    showNotification('Fjalëkalimet nuk përputhen!');
                    return;
                }
            }
            
            // Fill in payment summary with customer info
            updatePaymentSummary();
            goToStep(3);
        });
    }
    
    if (nextToStep4) {
        nextToStep4.addEventListener('click', function(e) {
            // Get payment method
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            
            const paymentMethod = selectedPayment.value;
            
            if (paymentMethod === 'paypal') {
                e.preventDefault(); // Prevent default navigation
                
                // Validate customer info form
                const customerForm = document.getElementById('customer-info-form');
                if (customerForm && !customerForm.checkValidity()) {
                    // Trigger HTML5 validation
                    customerForm.reportValidity();
                    return;
                }
                
                // Get full order details
                const orderDetails = generateOrderSummary();
                
                // Show PayPal buttons
                loadPayPalSDK(orderDetails);
            } else {
                // Process regular order with customer details
                const orderDetails = processOrder();
                goToStep(4);
                
                // Send email notification with order details
                sendOrderConfirmationEmail(orderDetails);
                
                // Save order to localStorage
                saveOrderToStorage(orderDetails);
            }
        });
    }
    
    // Backward navigation
    if (backToStep1) {
        backToStep1.addEventListener('click', function() {
            goToStep(1);
        });
    }
    
    if (backToStep2) {
        backToStep2.addEventListener('click', function() {
            goToStep(2);
        });
    }
    
    // Navigation function
    function goToStep(step) {
        // Hide all steps
        [step1, step2, step3, step4].forEach(s => {
            if (s) s.classList.remove('active');
        });
        
        // Update progress indicators
        progressSteps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('completed');
                s.classList.add('active');
            } else if (index === step - 1) {
                s.classList.remove('completed');
                s.classList.add('active');
            } else {
                s.classList.remove('completed');
                s.classList.remove('active');
            }
        });
        
        // Show the selected step
        switch (step) {
            case 1:
                if (step1) step1.classList.add('active');
                break;
            case 2:
                if (step2) step2.classList.add('active');
                break;
            case 3:
                if (step3) step3.classList.add('active');
                break;
            case 4:
                if (step4) step4.classList.add('active');
                break;
        }
        
        // Scroll to top of checkout section
        window.scrollTo({
            top: document.querySelector('.checkout-progress').offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

// Load recommended products based on cart contents
function loadRecommendedProducts() {
    const recommendationsContainer = document.querySelector('.recommendation-items');
    if (!recommendationsContainer) return;
    
    // Get products from global products array or use predefined products
    let allProducts = window.products || enisiProducts;
    if (!allProducts || allProducts.length === 0) return;
    
    // Get current cart item IDs
    const cartItemIds = cart.map(item => item.id);
    
    // Filter out products already in cart
    const availableProducts = allProducts.filter(product => !cartItemIds.includes(product.id));
    
    // Get up to 3 random products as recommendations
    const randomProducts = getRandomProducts(availableProducts, 3);
    
    // Clear container
    recommendationsContainer.innerHTML = '';
    
    // Add recommendations
    randomProducts.forEach(product => {
        const recItem = document.createElement('div');
        recItem.className = 'recommendation-item';
        
        recItem.innerHTML = `
            <img src="${getSimpleProductImage(product.id) || product.image}" alt="${product.name}" 
                onerror="this.src='https://via.placeholder.com/80x80?text=Pa+Foto'">
            <div class="rec-details">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} €</p>
            </div>
            <button class="btn-add-recommendation" data-product-id="${product.id}">+</button>
        `;
        
        recommendationsContainer.appendChild(recItem);
        
        // Add click handler
        recItem.querySelector('.btn-add-recommendation').addEventListener('click', function() {
            addToCart(product);
            showNotification('Produkti u shtua në shportë!');
            updateCartUI();
            updateOrderSummaries();
        });
    });
}

// Get random products from array
function getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Initialize coupon code functionality
function initCouponCode() {
    const applyButton = document.getElementById('apply-coupon');
    const couponInput = document.getElementById('coupon-code');
    
    if (!applyButton || !couponInput) return;
    
    // Available coupon codes
    const coupons = {
        'ENISI10': { discount: 0.10, type: 'percent', description: '10% zbritje' },
        'FREEDELIVERY': { discount: 5, type: 'fixed', description: 'Transport falas' },
        'WELCOME15': { discount: 0.15, type: 'percent', description: '15% zbritje' }
    };
    
    applyButton.addEventListener('click', function() {
        const couponCode = couponInput.value.trim().toUpperCase();
        const couponInfo = coupons[couponCode];
        
        if (couponInfo) {
            // Valid coupon
            couponInput.classList.add('coupon-valid');
            couponInput.classList.remove('coupon-invalid');
            
            // Store coupon in session storage
            sessionStorage.setItem('appliedCoupon', JSON.stringify({
                code: couponCode,
                ...couponInfo
            }));
            
            // Show notification
            showNotification(`Kodi "${couponCode}" u aplikua me sukses! ${couponInfo.description}`);
            
            // Update all summaries to reflect the discount
            updateCartSummary();
            updateOrderSummaries();
            updatePaymentMethodTotals();
            
        } else {
            // Invalid coupon
            couponInput.classList.add('coupon-invalid');
            couponInput.classList.remove('coupon-valid');
            
            // Remove any previously applied coupon
            sessionStorage.removeItem('appliedCoupon');
            
            // Show error notification
            showNotification('Kodi promocional i pavlefshëm!');
        }
    });
}

// Add/update this function to recalculate all cart summaries when a coupon is applied
function updateCartSummary() {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryOption')) || { price: 2.00 };
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * appliedCoupon.discount;
        } else {
            discount = appliedCoupon.discount;
        }
    }
    
    const total = subtotal - discount + deliveryInfo.price;
    
    cartSummary.innerHTML = `
        <div class="summary-item">
            <span>Nëntotali:</span>
            <span>${subtotal.toFixed(2)} €</span>
        </div>
        ${appliedCoupon ? `
        <div class="summary-item">
            <span>Zbritje (${appliedCoupon.code}):</span>
            <span>-${discount.toFixed(2)} €</span>
        </div>
        ` : ''}
        <div class="summary-item">
            <span>Transporti:</span>
            <span>${deliveryInfo.price.toFixed(2)} €</span>
        </div>
        <div class="summary-item total">
            <span>Totali:</span>
            <span>${total.toFixed(2)} €</span>
        </div>
    `;
}

// Initialize delivery option handlers
function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    
    if (deliveryOptions.length === 0) return;
    
    // Set default delivery option in session storage
    if (!sessionStorage.getItem('deliveryOption')) {
        sessionStorage.setItem('deliveryOption', JSON.stringify({
            type: 'standard',
            price: 2.00,
            description: 'Dërgesa standarde (2-3 ditë pune)'
        }));
    }
    
    // Add change listeners to update the delivery price
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            let deliveryInfo = {
                type: this.value,
                price: 0,
                description: ''
            };
            
            switch (this.value) {
                case 'standard':
                    deliveryInfo.price = 2.00;
                    deliveryInfo.description = 'Dërgesa standarde (2-3 ditë pune)';
                    break;
                case 'express':
                    deliveryInfo.price = 8.00;
                    deliveryInfo.description = 'Dërgesa e shpejtë (brenda 24 orëve)';
                    break;
                case 'pickup':
                    deliveryInfo.price = 0.00;
                    deliveryInfo.description = 'Marrje në dyqan';
                    break;
            }
            
            // Save selected delivery option
            sessionStorage.setItem('deliveryOption', JSON.stringify(deliveryInfo));
            
            // Update cart display with new shipping
            updateCartUI();
            updateOrderSummaries();
            
            // Update delivery estimate
            updateDeliveryEstimate(this.value);
        });
    });
}

// Update delivery estimate based on selected option
function updateDeliveryEstimate(deliveryType) {
    const estimateDate = document.querySelector('.estimate-date');
    if (!estimateDate) return;
    
    const now = new Date();
    let deliveryDate;
    
    switch (deliveryType) {
        case 'express':
            // Add 1 day
            deliveryDate = new Date(now);
            deliveryDate.setDate(now.getDate() + 1);
            break;
        case 'pickup':
            // Same day to next day
            const today = new Date(now);
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            
            estimateDate.innerHTML = `<strong>${formatDate(today)} - ${formatDate(tomorrow)}</strong>`;
            // Store delivery info
            sessionStorage.setItem('deliveryOption', JSON.stringify({
                type: 'pickup',
                description: 'Marrje në dyqan',
                price: 0,
                date: formatDate(tomorrow)
            }));
            return;
        default:
            // Standard - Add 2-3 days
            const minDate = new Date(now);
            minDate.setDate(now.getDate() + 2);
            
            const maxDate = new Date(now);
            maxDate.setDate(now.getDate() + 3);
            
            estimateDate.innerHTML = `<strong>${formatDate(minDate)} - ${formatDate(maxDate)}</strong>`;
            // Store delivery info
            sessionStorage.setItem('deliveryOption', JSON.stringify({
                type: 'standard',
                description: 'Dërgesa standarde (2-3 ditë pune)',
                price: 2.00,
                date: `${formatDate(minDate)} - ${formatDate(maxDate)}`
            }));
            return;
    }
    
    estimateDate.innerHTML = `<strong>${formatDate(deliveryDate)}</strong>`;
    
    // Store delivery info in session storage
    sessionStorage.setItem('deliveryOption', JSON.stringify({
        type: deliveryType,
        description: deliveryType === 'express' ? 'Dërgesa e shpejtë (24 orë)' : 'Dërgesa standarde',
        price: deliveryType === 'express' ? 8.00 : 2.00,
        date: formatDate(deliveryDate)
    }));
}

// Fix payment total calculation
function updatePaymentSummary() {
    const paymentSummary = document.getElementById('payment-summary-details');
    if (!paymentSummary) return;
    
    // Get customer info
    const fullname = document.getElementById('fullname')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const address = document.getElementById('address')?.value || '';
    
    // Get order total
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryOption')) || { price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * appliedCoupon.discount;
        } else {
            discount = appliedCoupon.discount;
        }
    }
    
    const total = subtotal - discount + deliveryInfo.price;
    
    // Build payment summary
    paymentSummary.innerHTML = `
        <div class="payment-customer-info">
            <h4>Të dhënat e blerësit</h4>
            <p><strong>Emri:</strong> ${fullname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefoni:</strong> ${phone}</p>
            <p><strong>Adresa:</strong> ${address}, ${city}</p>
        </div>
        
        <div class="payment-delivery-info">
            <h4>Metoda e dërgesës</h4>
            <p>${deliveryInfo.description}</p>
            <p><strong>Data e pritshme:</strong> ${deliveryInfo.date || 'Brenda 2-3 ditëve'}</p>
        </div>
        
        <div class="payment-price-summary">
            <div class="summary-item">
                <span>Nëntotali:</span>
                <span>${subtotal.toFixed(2)} €</span>
            </div>
            
            ${appliedCoupon ? `
            <div class="summary-item">
                <span>Zbritje (${appliedCoupon.code}):</span>
                <span>-${discount.toFixed(2)} €</span>
            </div>
            ` : ''}
            
            <div class="summary-item">
                <span>Transport:</span>
                <span>${deliveryInfo.price.toFixed(2)} €</span>
            </div>
            
            <div class="summary-item total">
                <span>Totali:</span>
                <span>${total.toFixed(2)} €</span>
            </div>
        </div>
    `;
}

// Update payment method totals
function updatePaymentMethodTotals() {
    // Get current total
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryOption')) || { price: 2.00 };
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * appliedCoupon.discount;
        } else {
            discount = appliedCoupon.discount;
        }
    }
    
    const total = subtotal - discount + deliveryInfo.price;
    
    // Update all payment method totals
    const cashTotal = document.getElementById('cash-payment-total');
    const paypalTotal = document.getElementById('paypal-payment-total');
    const bankTotal = document.getElementById('bank-payment-total');
    
    if (cashTotal) cashTotal.textContent = total.toFixed(2);
    if (paypalTotal) paypalTotal.textContent = total.toFixed(2);
    if (bankTotal) bankTotal.textContent = total.toFixed(2);
}

// Call this in several places
document.addEventListener('DOMContentLoaded', function() {
    // Call after cart is loaded
    setTimeout(updatePaymentMethodTotals, 500);
    
    // Listen for delivery option changes to update totals
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    if (deliveryOptions.length > 0) {
        deliveryOptions.forEach(option => {
            option.addEventListener('change', function() {
                setTimeout(updatePaymentMethodTotals, 100);
            });
        });
    }
    
    // Listen for coupon application
    const applyButton = document.getElementById('apply-coupon');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            setTimeout(updatePaymentMethodTotals, 100);
        });
    }
});

// Update bank transfer payment method details
document.addEventListener('DOMContentLoaded', function() {
    // Other initialization code...
    
    // Update bank transfer details
    const bankDetails = document.querySelector('#payment-bank + label + .payment-details');
    if (bankDetails) {
        bankDetails.innerHTML = `
            <p>Ju lutem transferoni shumën në llogarinë bankare të mëposhtme:</p>
            <p><strong>Banka:</strong> Raiffeisen Bank Kosovo</p>
            <p><strong>Emri:</strong> ENISI CENTER SHPK</p>
            <p><strong>IBAN:</strong> XK052035000179951494</p>
            <p><strong>Referenca:</strong> Do të dërgohet me email</p>
        `;
    }
    
    // Init delivery estimate on page load
    if (document.querySelector('input[name="delivery"]:checked')) {
        const defaultDelivery = document.querySelector('input[name="delivery"]:checked').value;
        updateDeliveryEstimate(defaultDelivery);
    }
});

// Simplified PayPal integration without client-side SDK loading
function initPayPalCheckout() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    if (paymentMethods.length > 0) {
        // Set data attributes
        paymentMethods.forEach(method => {
            const radioInput = method.querySelector('input[type="radio"]');
            if (radioInput) {
                method.dataset.method = radioInput.value;
            }
        });
    }
    
    const paypalPaymentMethod = document.getElementById('payment-paypal');
    const nextToStep4 = document.getElementById('next-to-step-4');
    
    if (!paypalPaymentMethod || !nextToStep4) return;
    
    // Listen for payment method changes
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'paypal') {
                // Update next button text for PayPal
                nextToStep4.innerHTML = 'Vazhdo me PayPal <i class="fab fa-paypal"></i>';
                nextToStep4.classList.add('paypal-button');
            } else {
                // Reset next button text
                nextToStep4.innerHTML = 'Përfundo porosinë <i class="fas fa-check"></i>';
                nextToStep4.classList.remove('paypal-button');
            }
        });
    });
    
    // Handle button click for PayPal redirects
    nextToStep4.addEventListener('click', function(e) {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        
        if (selectedPayment === 'paypal') {
            e.preventDefault(); // Prevent default navigation
            
            // Generate order summary for PayPal reference
            const orderDetails = generateOrderSummary();
            
            // Show PayPal instructions directly
            redirectToPayPal(orderDetails);
        }
    });
}

// Simplified PayPal redirect
function redirectToPayPal(orderDetails) {
    const total = orderDetails.total.toFixed(2);
    const orderId = orderDetails.orderId;
    
    // Store the order in localStorage before redirecting
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        ...orderDetails,
        status: 'pending',
        paymentMethod: 'PayPal',
        date: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Create a dialog explaining next steps
    showConfirmationDialog(
        'Pagesa me PayPal',
        `
        <p>Do të ridrejtoheni tek PayPal për të përfunduar pagesën prej <strong>${total} €</strong></p>
        <p>Numri i porosisë suaj është: <strong>${orderId}</strong></p>
        <p>Ju lutemi përdorni këtë numër si referencë në pagesën tuaj.</p>
        `
    );
    
    // Option to redirect automatically
    setTimeout(() => {
        openPayPalPayment(total, orderId);
    }, 2000);
}

// Open PayPal directly with parameters
function openPayPalPayment(amount, orderId) {
    const paypalUrl = `https://www.paypal.com/paypalme/shabanejupi5/${amount}?description=Order%20${orderId}%20-%20Enisi%20Center`;
    window.open(paypalUrl, '_blank');
    
    // Show final confirmation
    goToStep(4);
    
    // Update the order confirmation page
    document.getElementById('order-number').textContent = orderId;
    document.getElementById('order-date').textContent = new Date().toLocaleDateString('sq-AL');
    document.getElementById('order-email').textContent = document.getElementById('email')?.value || 'N/A';
    document.getElementById('order-payment-method').textContent = 'PayPal (Në pritje)';
    
    // Update final order summary
    updateFinalOrderSummary(generateOrderSummary());
}

// Show confirmation dialog
function showConfirmationDialog(title, message) {
    // Create dialog
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'dialog-box';
    
    dialog.innerHTML = `
        <div class="dialog-header">
            <h3>${title}</h3>
        </div>
        <div class="dialog-content">
            ${message}
        </div>
        <div class="dialog-footer">
            <button class="btn continue-btn">Vazhdo</button>
            <button class="btn cancel-btn">Anullo</button>
        </div>
    `;
    
    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);
    
    // Handle buttons
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const continueBtn = dialog.querySelector('.continue-btn');
    
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(dialogOverlay);
    });
    
    continueBtn.addEventListener('click', function() {
        document.body.removeChild(dialogOverlay);
        openPayPalPayment(total, orderId);
    });
    
    return dialogOverlay;
}

//# sourceMappingURL=Checkout.js.map