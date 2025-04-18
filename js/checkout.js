/**
 * Checkout Page Functionality
 * Manages the multi-step checkout process, order submission, and payment options
 */

document.addEventListener('DOMContentLoaded', function() {
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
});

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
        nextToStep4.addEventListener('click', function() {
            // Process the order and go to confirmation
            processOrder();
            goToStep(4);
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
        const code = couponInput.value.trim().toUpperCase();
        
        if (!code) {
            showNotification('Ju lutemi shkruani një kod promocional.');
            return;
        }
        
        const coupon = coupons[code];
        
        if (coupon) {
            // Apply discount and save to session
            sessionStorage.setItem('appliedCoupon', JSON.stringify({
                code: code,
                ...coupon
            }));
            
            showNotification(`Kodi promocional "${code}" u aplikua me sukses: ${coupon.description}!`);
            
            // Update cart display with discount
            updateCartUI();
            updateOrderSummaries();
            
            // Style the input as success
            couponInput.classList.add('coupon-valid');
            setTimeout(() => couponInput.classList.remove('coupon-valid'), 2000);
            
        } else {
            showNotification('Kodi promocional është i pavlefshëm ose ka skaduar.');
            
            // Style the input as error
            couponInput.classList.add('coupon-invalid');
            setTimeout(() => couponInput.classList.remove('coupon-invalid'), 2000);
        }
    });
}

// Initialize delivery option handlers
function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    
    if (deliveryOptions.length === 0) return;
    
    // Set default delivery option in session storage
    if (!sessionStorage.getItem('deliveryOption')) {
        sessionStorage.setItem('deliveryOption', JSON.stringify({
            type: 'standard',
            price: 5.00,
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
                    deliveryInfo.price = 5.00;
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
    
    // Set initial checked state based on session storage
    const savedDelivery = JSON.parse(sessionStorage.getItem('deliveryOption'));
    if (savedDelivery) {
        const option = document.getElementById(`delivery-${savedDelivery.type}`);
        if (option) option.checked = true;
    }
}

// Update delivery estimate based on selected option
function updateDeliveryEstimate(deliveryType) {
    const estimateDate = document.querySelector('.estimate-date');
    if (!estimateDate) return;
    
    const now = new Date();
    let deliveryDate;
    
    switch (deliveryType) {
        case 'express':
            // Next day delivery
            deliveryDate = new Date(now);
            deliveryDate.setDate(now.getDate() + 1);
            // Skip weekends
            if (deliveryDate.getDay() === 0) deliveryDate.setDate(deliveryDate.getDate() + 1); // If Sunday
            if (now.getHours() >= 16) deliveryDate.setDate(deliveryDate.getDate() + 1); // If after 4pm
            
            estimateDate.innerHTML = `<strong>${formatDate(deliveryDate)}</strong>`;
            break;
            
        case 'standard':
            // 2-3 days delivery
            const startDate = new Date(now);
            startDate.setDate(now.getDate() + 2);
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + 3);
            
            // Skip weekends
            if (startDate.getDay() === 0) startDate.setDate(startDate.getDate() + 1);
            if (endDate.getDay() === 0) endDate.setDate(endDate.getDate() + 1);
            
            estimateDate.innerHTML = `<strong>${formatDate(startDate)} - ${formatDate(endDate)}</strong>`;
            break;
            
        case 'pickup':
            // Same day pickup if before 4pm
            if (now.getHours() < 16) {
                estimateDate.innerHTML = `<strong>Sot (${formatDate(now)})</strong>`;
            } else {
                deliveryDate = new Date(now);
                deliveryDate.setDate(now.getDate() + 1);
                // Skip Sunday
                if (deliveryDate.getDay() === 0) deliveryDate.setDate(deliveryDate.getDate() + 1);
                estimateDate.innerHTML = `<strong>Nesër (${formatDate(deliveryDate)})</strong>`;
            }
            break;
    }
}

// Format date as DD Month YYYY
function formatDate(date) {
    const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Initialize account creation toggle
function initAccountCreation() {
    const createAccountCheckbox = document.getElementById('create-account');
    const accountFields = document.getElementById('account-fields');
    
    if (!createAccountCheckbox || !accountFields) return;
    
    createAccountCheckbox.addEventListener('change', function() {
        if (this.checked) {
            accountFields.classList.remove('hidden-fields');
            document.getElementById('password').required = true;
            document.getElementById('confirm-password').required = true;
        } else {
            accountFields.classList.add('hidden-fields');
            document.getElementById('password').required = false;
            document.getElementById('confirm-password').required = false;
        }
    });
}

// Update all order summaries throughout the checkout process
function updateOrderSummaries() {
    // Update the order items summary for step 2
    updateOrderItemsSummary();
    
    // Update payment summary for step 3
    updatePaymentSummary();
    
    // Update final order summary for step 4
    updateFinalSummary();
}

// Update the order items summary for step 2
function updateOrderItemsSummary() {
    const summaryContainer = document.getElementById('order-items-summary');
    if (!summaryContainer) return;
    
    // Clear container
    summaryContainer.innerHTML = '';
    
    // Add summary header
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'summary-header';
    summaryHeader.innerHTML = `
        <span>Produkti</span>
        <span>Totali</span>
    `;
    summaryContainer.appendChild(summaryHeader);
    
    // Add cart items summary
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <span>${item.name} <strong>×${item.quantity}</strong></span>
            <span>${itemTotal.toFixed(2)} €</span>
        `;
        summaryContainer.appendChild(summaryItem);
    });
    
    // Get delivery option
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryOption')) || { price: 5.00 };
    const shippingCost = deliveryInfo.price;
    
    // Get applied coupon if any
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    let discount = 0;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * appliedCoupon.discount;
        } else if (appliedCoupon.type === 'fixed') {
            discount = appliedCoupon.discount;
        }
    }
    
    // Add subtotal, shipping, discount and total
    const subtotalElem = document.createElement('div');
    subtotalElem.className = 'summary-item subtotal';
    subtotalElem.innerHTML = `
        <span>Nëntotali:</span>
        <span>${subtotal.toFixed(2)} €</span>
    `;
    summaryContainer.appendChild(subtotalElem);
    
    if (discount > 0) {
        const discountElem = document.createElement('div');
        discountElem.className = 'summary-item discount';
        discountElem.innerHTML = `
            <span>Zbritje (${appliedCoupon.code}):</span>
            <span>-${discount.toFixed(2)} €</span>
        `;
        summaryContainer.appendChild(discountElem);
    }
    
    const shippingElem = document.createElement('div');
    shippingElem.className = 'summary-item shipping';
    shippingElem.innerHTML = `
        <span>Transport:</span>
        <span>${shippingCost.toFixed(2)} €</span>
    `;
    summaryContainer.appendChild(shippingElem);
    
    const total = subtotal - discount + shippingCost;
    const totalElem = document.createElement('div');
    totalElem.className = 'summary-item total';
    totalElem.innerHTML = `
        <span>Totali:</span>
        <span>${total.toFixed(2)} €</span>
    `;
    summaryContainer.appendChild(totalElem);
}

// Update payment summary for step 3
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
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryOption')) || { price: 5.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * appliedCoupon.discount;
        } else if (appliedCoupon.type === 'fixed') {
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

// Update final order summary for step 4
function updateFinalSummary() {
    // Will be filled during order processing
}

// Process the order
function processOrder() {
    // Get customer info
    const fullname = document.getElementById('fullname')?.value || 'Emër Mbiemër';
    const email = document.getElementById('email')?.value || 'email@example.com';
    
    // Generate order details
    const orderSummary = generateOrderSummary();
    
    // Get selected payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
    let paymentMethodText = 'Para në dorë';
    
    if (paymentMethod === 'paypal') {
        paymentMethodText = 'PayPal';
    } else if (paymentMethod === 'bank') {
        paymentMethodText = 'Transfertë bankare';
    }
    
    // Update order confirmation page
    document.getElementById('order-number').textContent = orderSummary.orderId;
    document.getElementById('order-date').textContent = new Date().toLocaleDateString('sq-AL');
    document.getElementById('order-email').textContent = email;
    document.getElementById('order-payment-method').textContent = paymentMethodText;
    
    // Update final summary
    const finalSummary = document.getElementById('order-summary-final');
    if (finalSummary) {
        finalSummary.innerHTML = `
            <h3>Detajet e porosisë</h3>
            
            <div class="final-items">
                ${orderSummary.items.map(item => `
                    <div class="final-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="final-summary-totals">
                <div class="summary-item">
                    <span>Nëntotali:</span>
                    <span>${orderSummary.subtotal.toFixed(2)} €</span>
                </div>
                
                ${orderSummary.discount > 0 ? `
                <div class="summary-item">
                    <span>Zbritje:</span>
                    <span>-${orderSummary.discount.toFixed(2)} €</span>
                </div>
                ` : ''}
                
                <div class="summary-item">
                    <span>Transport:</span>
                    <span>${orderSummary.shipping.toFixed(2)} €</span>
                </div>
                
                <div class="summary-item total">
                    <span>Totali i paguar:</span>
                    <span>${orderSummary.total.toFixed(2)} €</span>
                </div>
            </div>
        `;
    }
    
    // Clear cart after successful order
    cart = [];
    saveCart();
    updateCartCount();
    
    // Clear applied coupons and delivery options
    sessionStorage.removeItem('appliedCoupon');
    sessionStorage.removeItem('deliveryOption');
}

// Initialize invoice download
function initInvoiceDownload() {
    const downloadButton = document.getElementById('download-invoice');
    if (!downloadButton) return;
    
    downloadButton.addEventListener('click', function() {
        // In a real application, this would generate a PDF
        // For this example, we'll just show a notification
        showNotification('Fatura u shkarkua me sukses!');
    });
}