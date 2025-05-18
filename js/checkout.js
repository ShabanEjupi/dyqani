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
    console.log('Initializing checkout page...');
    
    // Initialize checkout step functionality
    initCheckoutSteps();
    
    // Initialize recommendation products
    loadRecommendedProducts();
    
    // Initialize coupon code handling
    initCouponCode();
    
    // Initialize delivery option handlers
    initDeliveryOptions();
    
    // Initialize account creation toggling
    if (typeof initAccountCreation === 'function') {
        initAccountCreation();
    }
    
    // Initialize step summaries
    updateOrderSummaries();
    
    // Initialize invoice download
    initInvoiceDownload();
    
    // Initialize PayPal checkout
    console.log('Setting up payment methods...');
    initPayPalCheckout();
    console.log('Payment methods initialized');
    
    // Select the default payment method and trigger the change event to update UI
    const defaultPayment = document.querySelector('input[name="payment"]:checked');
    if (defaultPayment) {
        console.log('Default payment method:', defaultPayment.value);
        // Manually trigger change event
        const event = new Event('change');
        defaultPayment.dispatchEvent(event);
    }
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    console.log('Checkout page fully initialized');
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
            // Verify there are items in the cart
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
        nextToStep4.addEventListener('click', function() {
            const rawCartFromLocalStorage = localStorage.getItem('cart');
            console.log('[DEBUG] nextToStep4 clicked. Shporta e papërpunuar nga localStorage:', rawCartFromLocalStorage);
            
            let parsedCartForSummary;
            try {
                parsedCartForSummary = JSON.parse(rawCartFromLocalStorage || '[]');
                console.log('[DEBUG] Artikujt e shportës së përpunuar që do të përdoren për përmbledhje:', JSON.stringify(parsedCartForSummary, null, 2));
                if (parsedCartForSummary.length > 0) {
                    parsedCartForSummary.forEach((item, index) => {
                        console.log(`[DEBUG] Artikulli ${index} për përmbledhje: emri=${item.name}, çmimi=${item.price}, sasia=${item.quantity}`);
                        if (item.price === undefined || typeof item.price !== 'number' || isNaN(item.price)) {
                            console.warn(`[DEBUG] Artikulli ${index} ('${item.name}') ka një çmim të pavlefshëm: ${item.price}`);
                        }
                        if (item.quantity === undefined || typeof item.quantity !== 'number' || isNaN(item.quantity)) {
                            console.warn(`[DEBUG] Artikulli ${index} ('${item.name}') ka një sasi të pavlefshme: ${item.quantity}`);
                        }
                    });
                } else {
                    console.warn('[DEBUG] Shporta është bosh sipas të dhënave të përpunuara për përmbledhje.');
                }
            } catch (e) {
                console.error('[DEBUG] Gabim gjatë përpunimit të shportës nga localStorage për përmbledhje:', e);
                parsedCartForSummary = [];
            }
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            const paymentMethodValue = selectedPayment.value;
            console.log('Duke vazhduar në konfirmim me metodën e pagesës:', paymentMethodValue);

            const orderSummary = generateOrderSummary(); 
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            console.log('[DEBUG] Përmbledhja e porosisë e gjeneruar në nextToStep4:', JSON.stringify(orderSummary, null, 2));
            
            orderSummary.paymentMethod = paymentMethodValue; 

            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));

            const orderNumberEl = document.getElementById('order-number');
            if (orderNumberEl) orderNumberEl.textContent = orderSummary.orderId;

            const orderDateEl = document.getElementById('order-date');
            if (orderDateEl) {
                const today = new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                orderDateEl.textContent = today.toLocaleDateString('sq-AL', options);
            }

            const orderEmailEl = document.getElementById('order-email');
            if (orderEmailEl) orderEmailEl.textContent = orderSummary.customerInfo.email || 'N/A';
            
            const orderPaymentMethodEl = document.getElementById('order-payment-method');
            if (orderPaymentMethodEl) {
                let paymentMethodText = 'Para në dorë';
                if (paymentMethodValue === 'bank') {
                    paymentMethodText = 'Transfertë bankare';
                } else if (paymentMethodValue === 'paypal') {
                    paymentMethodText = 'PayPal';
                }
                orderPaymentMethodEl.textContent = paymentMethodText;
            }

            updateFinalOrderSummary(orderSummary); 

            if (paymentMethodValue === 'paypal') {
                redirectToPayPal(orderSummary); 
            } else {
                goToStep(4);
                localStorage.setItem('cart', JSON.stringify([]));
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }
                console.log('Porosia u dërgua për pagesë cash/bank:', orderSummary);
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
            if (s) {
                s.classList.remove('active', 'completed');
                if (index < step -1 ) { 
                    s.classList.add('completed');
                } else if (index === step - 1) { 
                    s.classList.add('active');
                }
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
                updatePaymentSummary();
                updatePaymentMethodTotals();
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
    
    // Make goToStep available outside this function
    window.goToStep = goToStep;
}

// Redirect to PayPal for payment
function redirectToPayPal(orderDetails) {
    const total = orderDetails.total.toFixed(2);
    const orderId = orderDetails.orderId;
    
    // Save order details to session storage for retrieval after payment
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderDetails));
    
    // Create PayPal URL with order details
    const paypalUrl = `https://www.paypal.com/paypalme/shabanejupi5/${total}?description=Order%20${orderId}%20-%20Enisi%20Center&locale.x=sq_AL`;
    
    // Show confirmation before redirect
    if (confirm(`Do të ridrejtoheni tek PayPal për të përfunduar pagesën prej ${total} €. Dëshironi të vazhdoni?`)) {
        // Open PayPal in a new window
        window.open(paypalUrl, '_blank');
        
        // Show the final confirmation page
        const orderSummary = generateOrderSummary();
        document.getElementById('order-number').textContent = orderSummary.orderId;
                
        // Format current date
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('sq-AL', options);
        document.getElementById('order-date').textContent = formattedDate;
        
        document.getElementById('order-email').textContent = document.getElementById('email').value || 'N/A';
        document.getElementById('order-payment-method').textContent = 'PayPal (Në pritje)';
        
        // Update final summary
        updateFinalOrderSummary(orderSummary);
        
        // Go to confirmation page
        goToStep(4);
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
        'FREEDELIVERY': { discount: 2.00, type: 'fixed', description: 'Transport falas' },
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
            
            // Update all summaries after removing coupon
            updateCartSummary();
            updateOrderSummaries();
            updatePaymentMethodTotals();
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
            // Add 1 day for express delivery
            deliveryDate = new Date(now);
            deliveryDate.setDate(now.getDate() + 1);
            break;
        case 'pickup':
            // Same day for pickup
            deliveryDate = new Date(now);
            break;
        case 'standard':
        default:
            // Add 2-3 days for standard
            const minDate = new Date(now);
            minDate.setDate(now.getDate() + 2);
            
            const maxDate = new Date(now);
            maxDate.setDate(now.getDate() + 3);
            
            // Return range for standard delivery
            estimateDate.innerHTML = `<strong>${formatDate(minDate)} - ${formatDate(maxDate)}</strong>`;
            
            // Store delivery info in session storage
            sessionStorage.setItem('deliveryOption', JSON.stringify({
                type: deliveryType,
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
        description: deliveryType === 'express' ? 'Dërgesa e shpejtë (brenda 24 orëve)' : 'Marrje në dyqan',
        price: deliveryType === 'express' ? 8.00 : 0.00,
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
    let subtotal = 0;
    if (cart && cart.length) {
        subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
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
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const nextToStep4Button = document.getElementById('next-to-step-4'); // Renamed for clarity

    if (!paymentMethods.length || !nextToStep4Button) {
        console.warn('Payment methods or next-to-step-4 button not found in initPayPalCheckout.');
        return;
    }

    const originalButtonText = nextToStep4Button.innerHTML;

    paymentMethods.forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedMethod = this.value;
            console.log('Selected payment method:', selectedMethod);

            if (selectedMethod === 'paypal') {
                nextToStep4Button.innerHTML = 'Vazhdo me PayPal <i class="fab fa-paypal"></i>';
                nextToStep4Button.classList.add('paypal-button');
                // If you have specific PayPal SDK initialization, it could go here
                // or be triggered by the main click handler in initCheckoutSteps.
            } else {
                nextToStep4Button.innerHTML = originalButtonText;
                nextToStep4Button.classList.remove('paypal-button');
            }
            updatePaymentMethodTotals(); // Ensure this function is working correctly
        });
    });

    // DO NOT add nextToStep4Button.addEventListener('click', ...) here.
    // The main click handling for this button is in initCheckoutSteps.
}

// 2. Refined initCheckoutSteps: Ensure the nextToStep4 listener is robust.
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
            // Verify there are items in the cart
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
        nextToStep4.addEventListener('click', function() {
            const rawCartFromLocalStorage = localStorage.getItem('cart');
            console.log('[DEBUG] nextToStep4 clicked. Shporta e papërpunuar nga localStorage:', rawCartFromLocalStorage);
            
            let parsedCartForSummary;
            try {
                parsedCartForSummary = JSON.parse(rawCartFromLocalStorage || '[]');
                console.log('[DEBUG] Artikujt e shportës së përpunuar që do të përdoren për përmbledhje:', JSON.stringify(parsedCartForSummary, null, 2));
                if (parsedCartForSummary.length > 0) {
                    parsedCartForSummary.forEach((item, index) => {
                        console.log(`[DEBUG] Artikulli ${index} për përmbledhje: emri=${item.name}, çmimi=${item.price}, sasia=${item.quantity}`);
                        if (item.price === undefined || typeof item.price !== 'number' || isNaN(item.price)) {
                            console.warn(`[DEBUG] Artikulli ${index} ('${item.name}') ka një çmim të pavlefshëm: ${item.price}`);
                        }
                        if (item.quantity === undefined || typeof item.quantity !== 'number' || isNaN(item.quantity)) {
                            console.warn(`[DEBUG] Artikulli ${index} ('${item.name}') ka një sasi të pavlefshme: ${item.quantity}`);
                        }
                    });
                } else {
                    console.warn('[DEBUG] Shporta është bosh sipas të dhënave të përpunuara për përmbledhje.');
                }
            } catch (e) {
                console.error('[DEBUG] Gabim gjatë përpunimit të shportës nga localStorage për përmbledhje:', e);
                parsedCartForSummary = [];
            }
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            const paymentMethodValue = selectedPayment.value;
            console.log('Duke vazhduar në konfirmim me metodën e pagesës:', paymentMethodValue);

            const orderSummary = generateOrderSummary(); 
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            console.log('[DEBUG] Përmbledhja e porosisë e gjeneruar në nextToStep4:', JSON.stringify(orderSummary, null, 2));
            
            orderSummary.paymentMethod = paymentMethodValue; 

            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));

            const orderNumberEl = document.getElementById('order-number');
            if (orderNumberEl) orderNumberEl.textContent = orderSummary.orderId;

            const orderDateEl = document.getElementById('order-date');
            if (orderDateEl) {
                const today = new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                orderDateEl.textContent = today.toLocaleDateString('sq-AL', options);
            }

            const orderEmailEl = document.getElementById('order-email');
            if (orderEmailEl) orderEmailEl.textContent = orderSummary.customerInfo.email || 'N/A';
            
            const orderPaymentMethodEl = document.getElementById('order-payment-method');
            if (orderPaymentMethodEl) {
                let paymentMethodText = 'Para në dorë';
                if (paymentMethodValue === 'bank') {
                    paymentMethodText = 'Transfertë bankare';
                } else if (paymentMethodValue === 'paypal') {
                    paymentMethodText = 'PayPal';
                }
                orderPaymentMethodEl.textContent = paymentMethodText;
            }

            updateFinalOrderSummary(orderSummary); 

            if (paymentMethodValue === 'paypal') {
                redirectToPayPal(orderSummary); 
            } else {
                goToStep(4);
                // Clear cart ONLY for non-PayPal orders AFTER everything is processed for step 4
                localStorage.setItem('cart', JSON.stringify([]));
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }
                console.log('Porosia u dërgua për pagesë cash/bank:', orderSummary);
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
            if (s) {
                s.classList.remove('active', 'completed');
                if (index < step -1 ) { 
                    s.classList.add('completed');
                } else if (index === step - 1) { 
                    s.classList.add('active');
                }
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
                updatePaymentSummary();
                updatePaymentMethodTotals();
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
    
    // Make goToStep available outside this function
    window.goToStep = goToStep;
}

// 3. Define a comprehensive generateOrderSummary function
function generateOrderSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cartItems) {
        console.error("Cart is not available to generate order summary.");
        return null;
    }

    let subtotal = 0;
    const itemsForSummary = cartItems.map(item => {
        subtotal += item.price * item.quantity;
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image // Ensure image path is correct
        };
    });

    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || { name: 'Standard', price: 2.00, description: 'Dërgesa standarde' };
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon')) || null;

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
        } else {
            discountAmount = appliedCoupon.discount;
        }
        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
    }

    const total = subtotal - discountAmount + deliveryOption.price;
    const orderId = 'EC' + Date.now().toString().slice(-8);

    // Get customer info from form (Step 2)
    const fullname = document.getElementById('fullname')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const notes = document.getElementById('notes')?.value || '';


    return {
        orderId: orderId,
        date: new Date().toISOString(),
        items: itemsForSummary,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: {
            name: deliveryOption.name || deliveryOption.description, // Use name if available
            price: parseFloat(deliveryOption.price.toFixed(2))
        },
        coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discountAmount: parseFloat(discountAmount.toFixed(2))
        } : null,
        total: parseFloat(total.toFixed(2)),
        customerInfo: {
            fullname,
            email,
            phone,
            address,
            city,
            notes
        },
        paymentMethod: '' // Will be set by the click handler
    };
}

// 4. Define updateFinalOrderSummary function
function updateFinalOrderSummary(orderSummary) {
    const finalSummaryContainer = document.getElementById('order-summary-final');
    if (!finalSummaryContainer) {
        console.error('Final order summary container not found.');
        return;
    }

    let itemsHtml = '<div class="final-items"><h4>Artikujt e porositur:</h4>';
    orderSummary.items.forEach(item => {
        itemsHtml += `
            <div class="final-item">
                <img src="${item.image || '../assets/images/placeholder.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                <div class="final-item-details">
                    <p>${item.name} (x${item.quantity})</p>
                    <p>${item.price.toFixed(2)} €</p>
                </div>
                <p class="final-item-total">${(item.price * item.quantity).toFixed(2)} €</p>
            </div>
        `;
    });
    itemsHtml += '</div>';

    let totalsHtml = '<div class="final-summary-totals">';
    totalsHtml += `<p>Nëntotali: <span>${orderSummary.subtotal.toFixed(2)} €</span></p>`;
    totalsHtml += `<p>Transporti (${orderSummary.shipping.name}): <span>${orderSummary.shipping.price.toFixed(2)} €</span></p>`;
    if (orderSummary.coupon) {
        totalsHtml += `<p>Zbritja (${orderSummary.coupon.code}): <span>-${orderSummary.coupon.discountAmount.toFixed(2)} €</span></p>`;
    }
    totalsHtml += `<p class="grand-total"><strong>TOTALI: <span>${orderSummary.total.toFixed(2)} €</span></strong></p>`;
    totalsHtml += '</div>';

    finalSummaryContainer.innerHTML = itemsHtml + totalsHtml;
}

// Ensure redirectToPayPal also calls goToStep(4) if it doesn't already
function redirectToPayPal(orderDetails) {
    const total = orderDetails.total.toFixed(2);
    const orderId = orderDetails.orderId;
    
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderDetails));
    
    // This is a simplified redirect. If using PayPal SDK, the flow would be different.
    const paypalUrl = `https://www.paypal.com/paypalme/shabanejupi5/${total}?description=Order%20${orderId}%20-%20Enisi%20Center&locale.x=sq_AL`;
    
    // It's better to show the confirmation page *after* PayPal interaction.
    // For now, we go to step 4 and user completes PayPal in new tab.
    // A more robust solution would use PayPal SDK and handle onApprove.
    
    // Show a message that they are being redirected
    showNotification(`Duke ju ridrejtuar tek PayPal për pagesën prej ${total} €. Ju lutemi prisni...`, 5000);

    // Open PayPal in a new window/tab
    const paypalWindow = window.open(paypalUrl, '_blank');

    if (!paypalWindow || paypalWindow.closed || typeof paypalWindow.closed == 'undefined') {
        showNotification('Dritarja e PayPal u bllokua. Ju lutemi lejoni pop-ups dhe provoni përsëri.', 'error');
    }
    
    // Go to our confirmation page (Step 4)
    // The confirmation page should indicate that payment is pending via PayPal.
    document.getElementById('order-payment-method').textContent = 'PayPal (Në pritje të konfirmimit)';
    goToStep(4); 
    
    // Cart should be cleared only after successful payment confirmation from PayPal.
    // For this simplified flow, we might clear it optimistically or handle it later.
    // localStorage.setItem('cart', JSON.stringify([]));
    // if (typeof updateCartCount === 'function') updateCartCount();
}

function initInvoiceDownload() {
    const downloadButton = document.getElementById('download-invoice');
    if (!downloadButton) {
        console.warn('Download invoice button ("download-invoice") not found.');
        return;
    }

    downloadButton.addEventListener('click', function() {
        const orderSummaryString = sessionStorage.getItem('currentOrderSummaryForInvoice');
        if (!orderSummaryString) {
            showNotification('Detajet e porosisë nuk u gjetën për faturë.', 'error');
            console.error('No order summary found in sessionStorage for invoice.');
            return;
        }

        try {
            const orderSummary = JSON.parse(orderSummaryString);
            if (orderSummary.total === undefined || orderSummary.subtotal === undefined) {
                showNotification('Detajet e porosisë janë jo të plota. Fatura nuk mund të gjenerohet.', 'error');
                console.error('Order summary is incomplete for invoice:', orderSummary);
                return;
            }
            generateAndDownloadInvoice(orderSummary);
        } catch (error) {
            console.error('Error parsing order summary for invoice:', error);
            showNotification('Gabim gjatë përgatitjes së faturës.', 'error');
        }
    });
}

function generateAndDownloadInvoice(orderSummary) {
    console.log('[DEBUG] Funksioni generateAndDownloadInvoice u thirr me përmbledhjen:', JSON.stringify(orderSummary, null, 2));

    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        showNotification('Libraria jsPDF nuk është ngarkuar. Fatura nuk mund të gjenerohet.', 'error');
        console.error('[DEBUG] Libraria jsPDF NUK është e ngarkuar. window.jspdf është:', window.jspdf);
        return;
    }
    console.log('[DEBUG] Libraria jsPDF ËSHTË e ngarkuar. window.jspdf është:', window.jspdf);

    const { jsPDF } = jspdf; 
    const doc = new jsPDF();

    let yPos = 20;
    const lineSpacing = 7;
    const sectionSpacing = 10;
    const leftMargin = 15;
    const contentWidth = doc.internal.pageSize.getWidth() - (2 * leftMargin);

    const addText = (text, x = leftMargin, options = {}) => {
        doc.text(text, x, yPos, options);
        yPos += lineSpacing;
    };
    
    const addTitle = (text) => {
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(text, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        doc.setFont(undefined, 'normal');
        yPos += sectionSpacing;
    };

    // Header
    addTitle("Faturë - Enisi Center");
    doc.setFontSize(10);
    addText(`Rr. Bedri Bajrami, nr. 15, Podujevë`, doc.internal.pageSize.getWidth() / 2, { align: 'center' });
    yPos -= lineSpacing; // Adjust for single line address
    addText(`Email: center.enisi@gmail.com | Tel: +383 45 594 549`, doc.internal.pageSize.getWidth() / 2, { align: 'center' });
    yPos += sectionSpacing;

    // Order Details
    doc.setFontSize(12);
    addText(`Numri i Porosisë: ${orderSummary.orderId || 'N/A'}`);
    addText(`Data: ${new Date(orderSummary.date || Date.now()).toLocaleDateString('sq-AL', { day: '2-digit', month: 'long', year: 'numeric' })}`);
    yPos += lineSpacing;

    // Customer Information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    addText("Faturuar Për:");
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    addText(`${orderSummary.customerInfo.fullname || 'N/A'}`);
    addText(`${orderSummary.customerInfo.address || 'N/A'}, ${orderSummary.customerInfo.city || 'N/A'}`);
    addText(`Email: ${orderSummary.customerInfo.email || 'N/A'}`);
    addText(`Tel: ${orderSummary.customerInfo.phone || 'N/A'}`);
    yPos += sectionSpacing;

    // Items Table Header
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    const tableHeaderY = yPos;
    doc.text("Artikulli", leftMargin, tableHeaderY);
    doc.text("Sasia", leftMargin + contentWidth * 0.6, tableHeaderY, { align: 'right' });
    doc.text("Çmimi", leftMargin + contentWidth * 0.75, tableHeaderY, { align: 'right' });
    doc.text("Totali", leftMargin + contentWidth * 0.95, tableHeaderY, { align: 'right' });
    doc.setFont(undefined, 'normal');
    yPos += lineSpacing;
    doc.setLineWidth(0.2);
    doc.line(leftMargin, yPos - (lineSpacing * 0.7) , leftMargin + contentWidth, yPos - (lineSpacing*0.7));


    // Items
    doc.setFontSize(10);
    if (orderSummary.items && Array.isArray(orderSummary.items)) {
        orderSummary.items.forEach(item => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;

            const itemNameLines = doc.splitTextToSize(item.name || 'Artikull i panjohur', contentWidth * 0.55);
            let currentYForItem = yPos;
            doc.text(itemNameLines, leftMargin, currentYForItem);
            
            doc.text(itemQuantity.toString(), leftMargin + contentWidth * 0.6, currentYForItem, { align: 'right' });
            doc.text(`${itemPrice.toFixed(2)} €`, leftMargin + contentWidth * 0.75, currentYForItem, { align: 'right' });
            doc.text(`${itemTotal.toFixed(2)} €`, leftMargin + contentWidth * 0.95, currentYForItem, { align: 'right' });
            yPos += (itemNameLines.length * (lineSpacing * 0.8)); // Adjust yPos based on number of lines for item name
            yPos = Math.max(yPos, currentYForItem + lineSpacing); // Ensure yPos advances at least one line
        });
    } else {
        console.warn("[DEBUG] Nuk ka artikuj në përmbledhjen e porosisë për faturë ose formati është i pasaktë.");
        addText("Nuk ka artikuj në porosi.", leftMargin);
        yPos += lineSpacing;
    }
    doc.line(leftMargin, yPos - (lineSpacing * 0.7) , leftMargin + contentWidth, yPos - (lineSpacing*0.7));
    yPos += sectionSpacing * 0.5;

    // Totals Section
    const totalsXLabel = leftMargin + contentWidth * 0.6;
    const totalsXValue = leftMargin + contentWidth * 0.95;

    doc.setFontSize(10);
    doc.text("Nëntotali:", totalsXLabel, yPos, { align: 'right' });
    doc.text(`${(parseFloat(orderSummary.subtotal) || 0).toFixed(2)} €`, totalsXValue, yPos, { align: 'right' });
    yPos += lineSpacing;

    doc.text("Transporti:", totalsXLabel, yPos, { align: 'right' });
    doc.text(`${(parseFloat(orderSummary.shipping?.price) || 0).toFixed(2)} €`, totalsXValue, yPos, { align: 'right' });
    yPos += lineSpacing;

    if (orderSummary.coupon && orderSummary.coupon.discountAmount) {
        doc.text(`Zbritja (${orderSummary.coupon.code}):`, totalsXLabel, yPos, { align: 'right' });
        doc.text(`-${(parseFloat(orderSummary.coupon.discountAmount) || 0).toFixed(2)} €`, totalsXValue, yPos, { align: 'right' });
        yPos += lineSpacing;
    }
    
    doc.setLineWidth(0.3);
    doc.line(totalsXLabel - 5, yPos - (lineSpacing * 0.7), totalsXValue + 5, yPos - (lineSpacing * 0.7) );


    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("TOTALI:", totalsXLabel, yPos, { align: 'right' });
    doc.text(`${(parseFloat(orderSummary.total) || 0).toFixed(2)} €`, totalsXValue, yPos, { align: 'right' });
    doc.setFont(undefined, 'normal');
    yPos += sectionSpacing * 1.5;

    // Payment Method
    doc.setFontSize(10);
    let paymentMethodText = 'Para në dorë';
    if (orderSummary.paymentMethod === 'bank') paymentMethodText = 'Transfertë bankare';
    else if (orderSummary.paymentMethod === 'paypal') paymentMethodText = 'PayPal';
    addText(`Metoda e Pagesës: ${paymentMethodText}`);
    yPos += sectionSpacing;

    // Footer Note
    doc.setFontSize(9);
    doc.text("Faleminderit për blerjen tuaj!", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += lineSpacing * 0.8;
    doc.text("www.enisicenter.tech", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });

    doc.save(`Fature-EnisiCenter-${orderSummary.orderId || 'XXXX'}.pdf`);
    showNotification('Fatura u gjenerua me sukses!');
}

// Ensure initInvoiceDownload is called when the checkout page initializes
function initCheckoutPage() {
    // ... (your existing initializations in initCheckoutPage) ...
    console.log('Initializing checkout page...');
    
    initCheckoutSteps();
    loadRecommendedProducts();
    initCouponCode();
    initDeliveryOptions();
    if (typeof initAccountCreation === 'function') {
        initAccountCreation();
    }
    updateOrderSummaries();
    initInvoiceDownload(); // Make sure this is called
    
    console.log('Setting up payment methods...');
    initPayPalCheckout();
    console.log('Payment methods initialized');
    
    const defaultPayment = document.querySelector('input[name="payment"]:checked');
    if (defaultPayment) {
        console.log('Default payment method:', defaultPayment.value);
        const event = new Event('change');
        defaultPayment.dispatchEvent(event);
    }
    
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    console.log('Checkout page fully initialized');
}

//# sourceMappingURL=checkout.js.map