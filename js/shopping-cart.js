/**
 * Menaxhimi i shportës dhe procesit të checkout-it
 * Kombinim i funksionaliteteve nga cart.js dhe checkout.js
 */

// ===== INICIALIZIMI I SHPORTËS =====
// Inicializimi i variablës globale 'cart'
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Ngjarjet që ekzekutohen kur faqja ngarkohet plotësisht
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded in shopping-cart.js");
    
    // Prit që komponentet të ngarkohen para inicializimit
    let componentsLoaded = 0;
    document.addEventListener('component-loaded', function(e) {
        componentsLoaded++;
        // Pasi header dhe footer janë ngarkuar
        if (componentsLoaded >= 2) {
            initializeShoppingFeatures();
        }
    });
    
    // Fallback nëse komponentet nuk ngarkohen brenda 1 sekondë
    setTimeout(() => {
        initializeShoppingFeatures();
    }, 1000);
    
    // Update shportën menjëherë pas ngarkimit
    updateCartCount();
    
    // Nëse jemi në faqen e checkout, shfaq artikujt
    if (document.getElementById('cart-items')) {
        updateCartUI();
    }
    
    // Inicializo kuponin manualisht nëse është në faqen e checkout
    if (document.querySelector('.checkout-progress')) {
        initCouponCode();
    }
});

// Funksioni kryesor i inicializimit
function initializeShoppingFeatures() {
    console.log('Initializing shopping features...');
    
    // Nëse jemi në faqen e checkout
    if (document.querySelector('.checkout-progress')) {
        // Inicializimi i hapave të checkout
        initCheckoutSteps();
        
        // Ngarkimi i produkteve të rekomanduara
        loadRecommendedProducts();
        
        // Inicializimi i kodit promocional
        initCouponCode();
        
        // Inicializimi i opsioneve të transportit
        initDeliveryOptions();
        
        // Inicializimi i përmbledhjeve
        updateOrderSummaries();
        
        // Inicializimi i shkarkimit të faturës
        initInvoiceDownload();
        
        // Inicializimi i PayPal checkout
        initPayPalCheckout();
        
        console.log('Checkout features initialized');
    }
    
    console.log('Shopping features fully initialized');
}

// ===== FUNKSIONET E MENAXHIMIT TË SHPORTËS =====

// Shtimi i një produkti në shportë
function addToCart(product) {
    console.log("Adding to cart:", product);
    
    // Kontrollo nëse produkti ekziston në shportë
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Ruaj shportën në localStorage
    saveCart();
    
    // Përditëso UI
    updateCartCount();
    
    // Shfaq konfirmimin
    showNotification('Produkti u shtua në shportë!');
}

// Heqja e një produkti nga shporta
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    updateCartCount();
}

// Përditësimi i sasisë së një produkti
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

// Ruajtja e shportës në localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Përditësimi i numëruesit të artikujve në header
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Përditësimi i UI të shportës në faqen e checkout - zëvendësimi i plotë
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    // Pastro artikujt ekzistues
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Shporta juaj është bosh</p>';
        if (cartSummary) {
            cartSummary.innerHTML = '';
        }
        return;
    }
    
    // Shto çdo artikull të shportës në kontejner
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.productId = item.id;
        
        // Krijimi i përmbajtjes së artikullit
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
        
        // Shtimi i event listeners
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
    
    // KËRTU GJENDET PROBLEMI: Përditëso përmbledhjen e shportës
    if (cartSummary) {
        // Llogarit nëntotalin
        let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Merr opsionin e transportit
        const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                              { name: 'standard', price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
        
        // Merr kuponin e aplikuar
        const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
        
        // Llogarit zbritjen
        let discountAmount = 0;
        let shippingPrice = deliveryOption.price;
        
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percent') {
                discountAmount = subtotal * appliedCoupon.discount;
            } else if (appliedCoupon.type === 'shipping' && appliedCoupon.discount === 'free') {
                shippingPrice = 0;
            }
        }
        
        // Llogarit totalin
        const total = subtotal - discountAmount + shippingPrice;
        
        // Krijo HTML për përmbledhjen
        let summaryHTML = `<h3>Përmbledhje e porosisë</h3>`;
        
        // Shto artikujt
        cart.forEach(item => {
            summaryHTML += `
                <div class="summary-item">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)} €</span>
                </div>
            `;
        });
        
        // Shto nëntotalin
        summaryHTML += `
            <div class="summary-item">
                <span>Nëntotali:</span>
                <span>${subtotal.toFixed(2)} €</span>
            </div>
        `;
        
        // Shto zbritjen nëse është aplikuar një kupon
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percent') {
                summaryHTML += `
                    <div class="summary-item">
                        <span>Zbritja (${appliedCoupon.code}):</span>
                        <span>-${discountAmount.toFixed(2)} €</span>
                    </div>
                `;
            } else if (appliedCoupon.type === 'shipping') {
                summaryHTML += `
                    <div class="summary-item">
                        <span>Zbritja (${appliedCoupon.code}):</span>
                        <span>Transport falas</span>
                    </div>
                `;
            }
        }
        
        // Shto transportin
        summaryHTML += `
            <div class="summary-item">
                <span>Transporti:</span>
                <span>${shippingPrice.toFixed(2)} €</span>
            </div>
        `;
        
        // Shto totalin
        summaryHTML += `
            <div class="summary-item total">
                <span>TOTALI:</span>
                <span>${total.toFixed(2)} €</span>
            </div>
        `;
        
        // Vendos HTML-në në container
        cartSummary.innerHTML = summaryHTML;
    }
    
    // Përditëso përmbledhjet në hapat e checkout-it (nëse është e nevojshme)
    if (document.getElementById('order-items-summary')) {
        updateOrderSummaries();
    }
}

// ===== FUNKSIONET E CHECKOUT =====

// Inicializimi i hapave të checkout-it
function initCheckoutSteps() {
    console.log("Initializing checkout steps");
    
    // Get step navigation buttons
    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const nextToStep4 = document.getElementById('next-to-step-4');
    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    
    // Get step elements
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const step3 = document.getElementById('checkout-step-3');
    const step4 = document.getElementById('checkout-step-4');
    
    // Get progress indicators
    const progressSteps = document.querySelectorAll('.progress-step');
    
    if (!step1 || !step2 || !step3 || !step4) {
        console.error("Checkout steps not found in the DOM");
        return;
    }

    // Function to navigate between steps
    function goToStep(step) {
        console.log(`Navigating to step ${step}`);
        
        // Hide all steps and update progress indicators
        [step1, step2, step3, step4].forEach((s, i) => {
            if (s) {
                s.classList.remove('active');
                
                // Update progress indicators
                if (progressSteps[i]) {
                    progressSteps[i].classList.remove('active', 'completed');
                    if (i < step - 1) {
                        progressSteps[i].classList.add('completed');
                    } else if (i === step - 1) {
                        progressSteps[i].classList.add('active');
                    }
                }
            }
        });
        
        // Show the target step
        const targetStep = document.getElementById(`checkout-step-${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
            
            // Scroll to top of checkout section
            const checkoutProgress = document.querySelector('.checkout-progress');
            if (checkoutProgress) {
                window.scrollTo({
                    top: checkoutProgress.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Make goToStep available globally
    window.goToStep = goToStep;
    
    // Forward navigation
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            console.log("Proceeding to step 2");
            
            // Check if cart is not empty
            if (!cart || cart.length === 0) {
                showNotification('Shporta është bosh! Ju lutemi shtoni produkte para se të vazhdoni.');
                return;
            }
            
            goToStep(2);
        });
    }
    
    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            console.log("Proceeding to step 3");
            
            // Validate customer information form
            const customerForm = document.getElementById('customer-info-form');
            if (customerForm && !customerForm.checkValidity()) {
                customerForm.reportValidity();
                return;
            }
            
            // Update payment summary before showing payment options
            updatePaymentSummary();
            goToStep(3);
        });
    }
    
    if (nextToStep4) {
        nextToStep4.addEventListener('click', function() {
            console.log("Finalizing order");
            
            // Check if payment method is selected
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            
            const paymentMethod = selectedPayment.value;
            console.log("Selected payment method:", paymentMethod);
            
            // Generate order summary
            const orderSummary = generateOrderSummary();
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            
            // Save payment method to order summary
            orderSummary.paymentMethod = paymentMethod;
            
            // Save order summary for invoice generation
            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));
            
            // Update confirmation page with order details
            updateConfirmationDetails(orderSummary);
            
            // Navigate to confirmation step
            goToStep(4);
            
            // Clear cart after successful order
            cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
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
}

// Inicializimi i funksionalitetit të kodit promocional - zëvendësim i plotë
function initCouponCode() {
    console.log("Initializing coupon code functionality");
    
    const couponInput = document.getElementById('coupon-code');
    const applyButton = document.getElementById('apply-coupon');
    
    if (!couponInput || !applyButton) {
        console.error("Coupon elements not found");
        return;
    }
    
    // Rregullimi kryesor: Përdor preventDefault dhe bind për event handler-in
    applyButton.addEventListener('click', function(e) {
        e.preventDefault(); // Parandalon refreshimin e faqes
        const code = couponInput.value.trim();
        
        // Kontrollojmë nëse po heqim apo aplikojmë
        if (this.textContent.trim() === 'Hiq') {
            // Hiq kuponin nga sessionStorage
            sessionStorage.removeItem('appliedCoupon');
            
            // Reset UI
            couponInput.value = '';
            couponInput.disabled = false;
            couponInput.classList.remove('coupon-valid', 'coupon-invalid');
            this.textContent = 'Apliko';
            
            // Përditëso përmbledhjen
            updateFullCheckoutUI();
            showNotification('Kodi promocional u hoq me sukses.', 'info');
        } else {
            // Aplikojmë kuponin
            if (!code) {
                showNotification('Ju lutemi shkruani një kod promocional.');
                return;
            }
            
            // Lista e kuponëve të vlefshëm
            const validCoupons = {
                'WELCOME15': {
                    type: 'percent',
                    discount: 0.15,
                    description: '15% zbritje'
                },
                'ENISI10': {
                    type: 'percent',
                    discount: 0.10,
                    description: '10% zbritje'
                },
                'FREEDELIVERY': {
                    type: 'shipping',
                    discount: 'free',
                    description: 'Dërgesa falas'
                }
            };
            
            const normalizedCode = code.toUpperCase();
            
            // Kontrollo nëse kuponi është i vlefshëm
            if (validCoupons[normalizedCode]) {
                // Kuponi është i vlefshëm
                const coupon = {
                    code: normalizedCode,
                    ...validCoupons[normalizedCode]
                };
                
                // Ruaj kuponin në sessionStorage
                sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
                
                // Update UI
                couponInput.classList.add('coupon-valid');
                couponInput.classList.remove('coupon-invalid');
                couponInput.disabled = true;
                this.textContent = 'Hiq';
                
                // Create success message
                let successMessage = '';
                if (coupon.type === 'percent') {
                    successMessage = `Kodi promocional ${normalizedCode} u aplikua me sukses. ${coupon.description}.`;
                } else if (coupon.type === 'shipping') {
                    successMessage = 'Kodi promocional u aplikua. Dërgesa juaj është falas!';
                }
                
                // Përditëso përmbledhjen e porosisë
                updateFullCheckoutUI();
                showNotification(successMessage, 'success');
            } else {
                // Kuponi nuk është i vlefshëm
                couponInput.classList.add('coupon-invalid');
                couponInput.classList.remove('coupon-valid');
                showNotification('Kodi promocional nuk është i vlefshëm.', 'error');
            }
        }
    });
    
    // Apply coupon when Enter is pressed
    couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Parandalon refreshimin e faqes
            applyButton.click(); // Thërret click event në buton
        }
    });
    
    // Kontrollo për kupon ekzistues në session storage
    const existingCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    if (existingCoupon) {
        console.log("Found existing coupon:", existingCoupon);
        couponInput.value = existingCoupon.code;
        couponInput.classList.add('coupon-valid');
        couponInput.disabled = true;
        applyButton.textContent = 'Hiq';
    }
}

// Inicializimi i shkarkimit të faturës
function initInvoiceDownload() {
    console.log("Initializing invoice download");
    
    const downloadButton = document.getElementById('download-invoice');
    if (!downloadButton) return;
    
    downloadButton.addEventListener('click', function() {
        generateInvoicePDF();
    });
}

// Gjenerimi i PDF të faturës
function generateInvoicePDF() {
    console.log("Generating invoice PDF");
    
    // Check if jspdf is available
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("jsPDF library not found");
        showNotification('Gabim gjatë gjenerimit të faturës. Ju lutemi provoni më vonë.');
        return;
    }
    
    // Get order summary from session storage
    const orderSummary = JSON.parse(sessionStorage.getItem('currentOrderSummaryForInvoice'));
    if (!orderSummary) {
        console.error("No order summary found for invoice generation");
        showNotification('Nuk u gjet asnjë përmbledhje porosie për gjenerimin e faturës.');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add company logo and header
        doc.setFontSize(22);
        doc.setTextColor(74, 109, 167);
        doc.text('ENISI CENTER', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('FATURË', 105, 30, { align: 'center' });
        
        // Add invoice details
        doc.setFontSize(10);
        doc.text(`Numri i Faturës: ${orderSummary.orderId}`, 20, 45);
        
        // Format date
        const orderDate = new Date(orderSummary.date);
        const formattedDate = orderDate.toLocaleDateString('sq-AL');
        doc.text(`Data: ${formattedDate}`, 20, 50);
        
        // Add company info
        doc.text('ENISI CENTER SHPK', 150, 45, { align: 'right' });
        doc.text('Rr. Bedri Bajrami, Nr. 15', 150, 50, { align: 'right' });
        doc.text('Podujevë, Kosovo', 150, 55, { align: 'right' });
        doc.text('Tel: +383 45 594 549', 150, 60, { align: 'right' });
        
        // Add customer info
        doc.text('Të dhënat e blerësit:', 20, 70);
        doc.text(`Emri: ${orderSummary.customerInfo.fullname}`, 20, 75);
        doc.text(`Email: ${orderSummary.customerInfo.email}`, 20, 80);
        doc.text(`Telefoni: ${orderSummary.customerInfo.phone}`, 20, 85);
        doc.text(`Adresa: ${orderSummary.customerInfo.address}`, 20, 90);
        doc.text(`Qyteti: ${orderSummary.customerInfo.city}`, 20, 95);
        
        // Add table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 8, 'F');
        doc.text('Përshkrimi', 22, 110);
        doc.text('Sasia', 120, 110);
        doc.text('Çmimi', 140, 110);
        doc.text('Totali', 170, 110, { align: 'right' });
        
        // Add items
        let yPos = 115;
        orderSummary.items.forEach((item, index) => {
            doc.text(item.name.substring(0, 50), 22, yPos + index * 7);
            doc.text(item.quantity.toString(), 120, yPos + index * 7);
            doc.text(`${item.price.toFixed(2)} €`, 140, yPos + index * 7);
            doc.text(`${(item.price * item.quantity).toFixed(2)} €`, 170, yPos + index * 7, { align: 'right' });
        });
        
        // Calculate y position for summary
        const summaryYPos = yPos + orderSummary.items.length * 7 + 10;
        
        // Add summary
        doc.text('Nëntotali:', 130, summaryYPos);
        doc.text(`${orderSummary.subtotal.toFixed(2)} €`, 170, summaryYPos, { align: 'right' });
        
        // Add discount if applicable
        let currentYPos = summaryYPos + 7;
        if (orderSummary.coupon) {
            doc.text(`Zbritja (${orderSummary.coupon.code}):`, 130, currentYPos);
            doc.text(`-${orderSummary.coupon.discountAmount.toFixed(2)} €`, 170, currentYPos, { align: 'right' });
            currentYPos += 7;
        }
        
        // Add shipping
        doc.text('Transporti:', 130, currentYPos);
        doc.text(`${orderSummary.shipping.price.toFixed(2)} €`, 170, currentYPos, { align: 'right' });
        currentYPos += 7;
        
        // Add total
        doc.setFontSize(12);
        doc.setTextColor(74, 109, 167);
        doc.text('TOTALI:', 130, currentYPos + 3);
        doc.text(`${orderSummary.total.toFixed(2)} €`, 170, currentYPos + 3, { align: 'right' });
        
        // Add payment info
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Metoda e pagesës: ${getPaymentMethodText(orderSummary.paymentMethod)}`, 20, currentYPos + 15);
        
        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Faleminderit që zgjodhët ENISI CENTER!', 105, 280, { align: 'center' });
        doc.text('Për pyetje ose ndihmë shtesë, kontaktoni në +383 45 594 549 ose center.enisi@gmail.com', 105, 285, { align: 'center' });
        
        // Save PDF
        doc.save(`Fatura-${orderSummary.orderId}.pdf`);
        
        showNotification('Fatura u shkarkua me sukses!', 'success');
    } catch (error) {
        console.error("Error generating invoice:", error);
        showNotification('Gabim gjatë gjenerimit të faturës: ' + error.message);
    }
}

// Helper function to get payment method text
function getPaymentMethodText(method) {
    switch (method) {
        case 'cash': return 'Para në dorë';
        case 'paypal': return 'PayPal';
        case 'bank': return 'Transfertë bankare';
        default: return method;
    }
}

// Inicializimi i funksionalitetit të PayPal checkout
function initPayPalCheckout() {
    console.log("Initializing PayPal checkout functionality");
    
    // Gjej butonin e përfundimit të porosisë dhe metodat e pagesës
    const nextToStep4 = document.getElementById('next-to-step-4');
    const paymentMethods = document.getElementsByName('payment');
    
    if (!nextToStep4 || !paymentMethods.length) {
        console.error("Payment elements not found");
        return;
    }
    
    // Ndryshojmë stilin e butonit kur përdoruesi zgjedh PayPal
    for (let i = 0; i < paymentMethods.length; i++) {
        paymentMethods[i].addEventListener('change', function() {
            if (this.value === 'paypal') {
                nextToStep4.innerHTML = 'Vazhdo me PayPal <i class="fab fa-paypal"></i>';
                nextToStep4.classList.add('paypal-button');
            } else {
                nextToStep4.innerHTML = 'Përfundo porosinë <i class="fas fa-check"></i>';
                nextToStep4.classList.remove('paypal-button');
            }
        });
    }
    
    // Shtojmë logjikën për butonin e përfundimit
    if (nextToStep4) {
        // Remove any existing event listeners (to prevent duplicates)
        const newNextToStep4 = nextToStep4.cloneNode(true);
        nextToStep4.parentNode.replaceChild(newNextToStep4, nextToStep4);
        
        // Add the new event listener
        newNextToStep4.addEventListener('click', function(e) {
            // Check if payment method is selected
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            
            const paymentMethod = selectedPayment.value;
            console.log("Selected payment method:", paymentMethod);
            
            // Generate order summary for any payment method
            const orderSummary = generateOrderSummary();
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            
            // Save payment method to order summary
            orderSummary.paymentMethod = paymentMethod;
            
            // If PayPal is selected, redirect to PayPal.me
            if (paymentMethod === 'paypal') {
                e.preventDefault(); // Prevent default navigation
                
                // Generate PayPal.me URL with the proper username and amount
                const paypalUsername = 'shabanejupi5'; // Username-i juaj i PayPal.me
                const amount = orderSummary.total.toFixed(2);
                const description = `Order ${orderSummary.orderId} - Enisi Center`;
                
                const paypalUrl = `https://www.paypal.com/paypalme/${paypalUsername}/${amount}?description=${encodeURIComponent(description)}`;
                
                // Save order data before redirect
                sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));
                
                // Show notification before redirect
                showNotification('Duke ju ridrejtuar në PayPal për pagesë...', 'info');
                
                // Redirect to PayPal.me after a short delay
                setTimeout(() => {
                    window.location.href = paypalUrl;
                }, 1500);
                
                return; // Stop here for PayPal
            }
            
            // For other payment methods, proceed with standard checkout
            // Save order summary for invoice generation
            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));
            
            // Update confirmation page with order details
            updateConfirmationDetails(orderSummary);
            
            // Navigate to confirmation step
            goToStep(4);
            
            // Clear cart after successful order
            cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
            
            // Show success notification
            showNotification('Porosia juaj u përpunua me sukses!', 'success');
        });
    }
}

// Shfaqja e notifikimeve - zëvendësim i plotë
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`Notification (${type}):`, message);
    
    // Krijimi i elementit të notifikimit nëse nuk ekziston
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Vendosja e mesazhit dhe shfaqja
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Fshihe pas kohës së caktuar
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Inicializimi i opsioneve të transportit
function initDeliveryOptions() {
    console.log("Initializing delivery options");
    
    const deliveryOptions = document.querySelectorAll('.delivery-option input');
    if (!deliveryOptions || deliveryOptions.length === 0) {
        console.error("No delivery options found");
        return;
    }
    
    // Set default delivery option in sessionStorage if not already set
    if (!sessionStorage.getItem('deliveryOption')) {
        const defaultOption = {
            name: 'standard',
            price: 2.00,
            description: 'Dërgesa standarde (2-3 ditë pune)'
        };
        sessionStorage.setItem('deliveryOption', JSON.stringify(defaultOption));
    }
    
    // Add event listeners to all delivery option radio buttons
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            console.log("Delivery option changed to:", this.value);
            const deliveryValue = this.value;
            
            // Create delivery option object based on selected value
            let deliveryOption = {
                name: deliveryValue,
                price: 2.00,
                description: 'Dërgesa standarde (2-3 ditë pune)'
            };
            
            if (deliveryValue === 'express') {
                deliveryOption = {
                    name: 'express',
                    price: 8.00,
                    description: 'Dërgesa e shpejtë (24 orë)'
                };
            } else if (deliveryValue === 'pickup') {
                deliveryOption = {
                    name: 'pickup',
                    price: 0.00,
                    description: 'Marrje në dyqan (Falas)'
                };
            }
            
            // Save delivery option to session storage
            sessionStorage.setItem('deliveryOption', JSON.stringify(deliveryOption));
            
            // Update the estimate text
            updateDeliveryEstimate(deliveryValue);
            
            // NDRYSHIMI KRYESOR: Përditëso të gjithë UI-n
            updateFullCheckoutUI();
        });
    });
    
    // Select the correct radio button based on saved option
    const savedDeliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption'));
    if (savedDeliveryOption) {
        const radioToSelect = document.querySelector(`input[name="delivery"][value="${savedDeliveryOption.name}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
    }
    
    // Update delivery estimate on page load
    updateDeliveryEstimate(savedDeliveryOption?.name || 'standard');
}

// Përditësimi i kohës së dërgesës
function updateDeliveryEstimate(deliveryType) {
    const estimateText = document.querySelector('.estimate-date strong');
    if (!estimateText) return;
    
    let estimateMessage = 'Brenda 2-3 ditëve';
    
    if (deliveryType === 'express') {
        estimateMessage = 'Brenda 24 orëve';
    } else if (deliveryType === 'pickup') {
        estimateMessage = 'Sot, nëse vini para orës 18:00';
    }
    
    estimateText.textContent = estimateMessage;
}

// Përditësimi i përmbledhjeve të porosisë
function updateOrderSummaries() {
    console.log("Updating order summaries");
    
    // Merr përmbledhjen e porosisë në hapin 1
    const orderItemsSummary = document.getElementById('order-items-summary');
    if (!orderItemsSummary) {
        console.error("Order items summary element not found");
        return;
    }
    
    // Sigurohu që kemi artikuj në shportë
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        orderItemsSummary.innerHTML = '<p class="empty-cart">Shporta juaj është bosh</p>';
        return;
    }
    
    // Llogarit nëntotalin
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    console.log("Calculated subtotal:", subtotal);
    
    // Merr opsionin e transportit
    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                         { name: 'standard', price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    
    // Merr kuponin e aplikuar
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    console.log("Applied coupon:", appliedCoupon);
    
    // Llogarit zbritjen
    let discountAmount = 0;
    let shippingPrice = deliveryOption.price;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
            console.log(`Calculating ${appliedCoupon.discount * 100}% discount: ${discountAmount}`);
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.discount;
        } else if (appliedCoupon.type === 'shipping' && appliedCoupon.discount === 'free') {
            shippingPrice = 0;
            console.log("Free shipping applied");
        }
    }
    
    // Llogarit totalin
    const total = subtotal - discountAmount + shippingPrice;
    console.log(`Final calculation: ${subtotal} - ${discountAmount} + ${shippingPrice} = ${total}`);
    
    // Ruaj përmbledhjen e porosisë për përdorim të mëvonshëm
    window.currentOrderSummary = {
        items: cart.map(item => ({...item})),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discountAmount.toFixed(2)),
        shipping: parseFloat(shippingPrice.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        coupon: appliedCoupon
    };

    // Përditëso HTML e përmbledhjes
    let summaryHTML = '';
    
    // Shto artikujt
    cart.forEach(item => {
        summaryHTML += `
            <div class="summary-item">
                <span>${item.name} (x${item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)} €</span>
            </div>
        `;
    });
    
    // Shto nëntotalin
    summaryHTML += `
        <div class="summary-item">
            <span>Nëntotali:</span>
            <span>${subtotal.toFixed(2)} €</span>
        </div>
    `;
    
    // Shto zbritjen nëse është aplikuar një kupon
    if (appliedCoupon) {
        if (appliedCoupon.type === 'shipping') {
            summaryHTML += `
                <div class="summary-item">
                    <span>Zbritja (${appliedCoupon.code}):</span>
                    <span>Transport falas</span>
                </div>
            `;
        } else if (appliedCoupon.type === 'percent') {
            summaryHTML += `
                <div class="summary-item">
                    <span>Zbritja (${appliedCoupon.code}):</span>
                    <span>-${discountAmount.toFixed(2)} €</span>
                </div>
            `;
        }
    }
    
    // Shto transportin
    summaryHTML += `
        <div class="summary-item">
            <span>Transport (${deliveryOption.description}):</span>
            <span>${shippingPrice.toFixed(2)} €</span>
        </div>
    `;
    
    // Shto totalin
    summaryHTML += `
        <div class="summary-item total">
            <span>TOTALI:</span>
            <span>${total.toFixed(2)} €</span>
        </div>
    `;
    
    // Përditëso HTML
    orderItemsSummary.innerHTML = summaryHTML;
    
    // Përditëso përmbledhjen e pagesës në hapin 3
    updatePaymentSummary();
}

// Përditësimi i përmbledhjes së pagesës
function updatePaymentSummary() {
    console.log("Updating payment summary");
    
    const paymentSummaryDetails = document.getElementById('payment-summary-details');
    if (!paymentSummaryDetails) {
        console.error("Payment summary details element not found");
        return;
    }
    
    const orderSummary = window.currentOrderSummary;
    if (!orderSummary) {
        console.error("No order summary available");
        return;
    }
    
    // Përditëso HTML e përmbledhjes së pagesës
    let summaryHTML = '';
    
    // Shto nëntotalin
    summaryHTML += `
        <div class="summary-item">
            <span>Nëntotali:</span>
            <span>${orderSummary.subtotal.toFixed(2)} €</span>
        </div>
    `;
    
    // Shto zbritjen nëse ka
    if (orderSummary.coupon) {
        if (orderSummary.coupon.type === 'shipping') {
            summaryHTML += `
                <div class="summary-item">
                    <span>Zbritja (${orderSummary.coupon.code}):</span>
                    <span>Transport falas</span>
                </div>
            `;
        } else {
            summaryHTML += `
                <div class="summary-item">
                    <span>Zbritja (${orderSummary.coupon.code}):</span>
                    <span>-${orderSummary.discount.toFixed(2)} €</span>
                </div>
            `;
        }
    }
    
    // Shto transportin
    summaryHTML += `
        <div class="summary-item">
            <span>Transporti:</span>
            <span>${orderSummary.shipping.toFixed(2)} €</span>
        </div>
    `;
    
    // Shto totalin
    summaryHTML += `
        <div class="summary-item total">
            <span>TOTALI:</span>
            <span>${orderSummary.total.toFixed(2)} €</span>
        </div>
    `;
    
    // Përditëso HTML
    paymentSummaryDetails.innerHTML = summaryHTML;
    
    // Përditëso shumat në metodat e pagesës
    const cashTotal = document.getElementById('cash-payment-total');
    const paypalTotal = document.getElementById('paypal-payment-total');
    const bankTotal = document.getElementById('bank-payment-total');
    
    if (cashTotal) cashTotal.textContent = orderSummary.total.toFixed(2);
    if (paypalTotal) paypalTotal.textContent = orderSummary.total.toFixed(2);
    if (bankTotal) bankTotal.textContent = orderSummary.total.toFixed(2);
}

// Funksioni i rregulluar për kodin promocional
function applyCouponCode(code) {
    console.log("Handling coupon code:", code);
    
    const couponInput = document.getElementById('coupon-code');
    const applyButton = document.getElementById('apply-coupon');
    
    if (!couponInput || !applyButton) {
        console.error("Coupon elements not found");
        return;
    }
    
    // Kritike: Lexo vlerën aktuale nga fusha nëse nuk është kaluar një kod
    if (!code || code.trim() === '') {
        code = couponInput.value.trim();
        // Kontrollo prap nëse është bosh pas trim()
        if (code === '') {
            showNotification('Ju lutemi shkruani një kod promocional.', 'info');
            return;
        }
    }
    
    // Kontrollo nëse po heqim apo po aplikojmë kuponin
    const isRemoving = applyButton.textContent.trim() === 'Hiq';
    
    if (isRemoving) {
        console.log("Removing existing coupon");
        
        // Hiq kuponin nga sessionStorage
        sessionStorage.removeItem('appliedCoupon');
        
        // Reset UI
        couponInput.value = '';
        couponInput.disabled = false;
        couponInput.classList.remove('coupon-valid', 'coupon-invalid');
        applyButton.textContent = 'Apliko';
        
        // Përditëso përmbledhjet
        updateFullCheckoutUI();
        
        showNotification('Kodi promocional u hoq me sukses.', 'info');
        return;
    }
    
    // Po aplikojmë një kupon - kodi është marrë nga input-i tashmë
    const normalizedCode = code.toUpperCase();
    console.log("Attempting to apply coupon code:", normalizedCode);
    
    // Lista e kuponëve të vlefshëm
    const validCoupons = {
        'WELCOME15': {
            type: 'percent',
            discount: 0.15,
            description: '15% zbritje'
        },
        'ENISI10': {
            type: 'percent',
            discount: 0.10,
            description: '10% zbritje'
        },
        'FREEDELIVERY': {
            type: 'shipping',
            discount: 'free',
            description: 'Dërgesa falas'
        }
    };
    
    console.log("Checking if coupon is valid. Available coupons:", Object.keys(validCoupons));
    
    // Kontrollo nëse kuponi është i vlefshëm
    if (validCoupons[normalizedCode]) {
        // Kuponi është i vlefshëm
        const coupon = {
            code: normalizedCode,
            ...validCoupons[normalizedCode]
        };
        
        console.log("Valid coupon applied:", coupon);
        
        // Ruaj kuponin në sessionStorage
        sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        
        // Update UI
        couponInput.classList.add('coupon-valid');
        couponInput.classList.remove('coupon-invalid');
        couponInput.disabled = true;
        applyButton.textContent = 'Hiq';
        
        // Create success message
        let successMessage = '';
        if (coupon.type === 'percent') {
            successMessage = `Kodi promocional ${normalizedCode} u aplikua me sukses. ${coupon.description}.`;
        } else if (coupon.type === 'shipping') {
            successMessage = 'Kodi promocional u aplikua. Dërgesa juaj është falas!';
        }
        
        // Përditëso përmbledhjen e porosisë
        updateFullCheckoutUI();
        
        showNotification(successMessage, 'success');
    } else {
        // Kuponi nuk është i vlefshëm
        console.error("Invalid coupon code:", normalizedCode);
        couponInput.classList.add('coupon-invalid');
        couponInput.classList.remove('coupon-valid');
        showNotification('Kodi promocional nuk është i vlefshëm.', 'error');
    }
}

// Funksion i përmirësuar për të gjeneruar përmbledhjen e porosisë
function generateOrderSummary() {
    console.log("Generating order summary");
    
    // Kontrollo nëse shporta është e zbrazët
    if (!cart || cart.length === 0) {
        console.error("Cart is empty, can't generate order summary");
        return null;
    }
    
    // Gjenero një ID unike të porositë
    const orderId = 'EC' + Date.now().toString().slice(-8);
    
    // Mbledh të dhënat e artikujve
    let subtotal = 0;
    const itemsForSummary = cart.map(item => {
        subtotal += item.price * item.quantity;
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        };
    });
    
    // Merr opsionin e transportit
    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                         { name: 'standard', price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    
    // Merr kuponin e aplikuar
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    // Llogarit zbritjen
    let discountAmount = 0;
    let shippingPrice = deliveryOption.price;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.discount;
        } else if (appliedCoupon.type === 'shipping' && appliedCoupon.discount === 'free') {
            shippingPrice = 0;
        }
    }
    
    // Llogarit totalin
    const total = subtotal - discountAmount + shippingPrice;
    
    // Merr të dhënat e blerësit
    const customerInfo = {
        fullname: document.getElementById('fullname')?.value || 'N/A',
        email: document.getElementById('email')?.value || 'N/A',
        phone: document.getElementById('phone')?.value || 'N/A',
        address: document.getElementById('address')?.value || 'N/A',
        city: document.getElementById('city')?.value || 'N/A',
        notes: document.getElementById('notes')?.value || ''
    };
    
    // Krijo objektin e përmbledhjes së porosisë
    return {
        orderId: orderId,
        date: new Date().toISOString(),
        items: itemsForSummary,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discountAmount.toFixed(2)),
        shipping: {
            price: parseFloat(shippingPrice.toFixed(2)),
            method: deliveryOption
        },
        total: parseFloat(total.toFixed(2)),
        coupon: appliedCoupon,
        customerInfo: customerInfo,
        paymentMethod: null // Will be set later
    };
}

// Përditëso të dhënat e konfirmimit
function updateConfirmationDetails(orderSummary) {
    console.log("Updating confirmation details with:", orderSummary);
    
    // Update order info
    document.getElementById('order-number').textContent = orderSummary.orderId;
    
    // Format date for display
    const orderDate = new Date(orderSummary.date);
    const formattedDate = orderDate.toLocaleDateString('sq-AL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('order-date').textContent = formattedDate;
    
    // Update customer email
    document.getElementById('order-email').textContent = orderSummary.customerInfo.email;
    
    // Update payment method text
    let paymentMethodText = 'Para në dorë';
    if (orderSummary.paymentMethod === 'paypal') {
        paymentMethodText = 'PayPal';
    } else if (orderSummary.paymentMethod === 'bank') {
        paymentMethodText = 'Transfertë bankare';
    }
    document.getElementById('order-payment-method').textContent = paymentMethodText;
    
    // Update order summary final
    const finalSummaryContainer = document.getElementById('order-summary-final');
    if (finalSummaryContainer) {
        let finalSummaryHTML = '<div class="final-items">';
        
        // Add items
        orderSummary.items.forEach(item => {
            finalSummaryHTML += `
                <div class="final-item">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)} €</span>
                </div>
            `;
        });
        
        finalSummaryHTML += '</div><div class="final-summary-totals">';
        
        // Add subtotal
        finalSummaryHTML += `
            <div class="summary-item">
                <span>Nëntotali:</span>
                <span>${orderSummary.subtotal.toFixed(2)} €</span>
            </div>
        `;
        
        // Add discount if applicable
        if (orderSummary.coupon) {
            finalSummaryHTML += `
                <div class="summary-item">
                    <span>Zbritja (${orderSummary.coupon.code}):</span>
                    <span>${orderSummary.coupon.discountAmount.toFixed(2)} €</span>
                </div>
            `;
        }
        
        // Add shipping cost
        finalSummaryHTML += `
            <div class="summary-item">
                <span>Transporti:</span>
                <span>${orderSummary.shipping.price.toFixed(2)} €</span>
            </div>
        `;
        
        // Add total
        finalSummaryHTML += `
            <div class="summary-item total">
                <span>TOTALI:</span>
                <span>${orderSummary.total.toFixed(2)} €</span>
            </div>
        `;
        
        finalSummaryHTML += '</div>';
        finalSummaryContainer.innerHTML = finalSummaryHTML;
    }
}

// Funksioni për të ngarkuar produktet e rekomanduara - me përmirësim
function loadRecommendedProducts() {
    console.log("Loading recommended products");
    
    const recommendationContainer = document.querySelector('.recommendation-items');
    if (!recommendationContainer) return;
    
    // Zgjidh 3 produkte random nga lista e produkteve
    // Fillimisht kontrollojmë nëse products është i disponueshëm globalisht
    if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
        // Shuffle products array
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        // Get first 3
        const selectedProducts = shuffled.slice(0, 3);
        
        // Add to recommendation container
        selectedProducts.forEach(product => {
            const recItem = document.createElement('div');
            recItem.className = 'recommendation-item';
            recItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" 
                    onerror="this.src='https://via.placeholder.com/80x80?text=Pa+Foto'">
                <div class="rec-details">
                    <h4>${product.name}</h4>
                    <p>${product.price.toFixed(2)} €</p>
                </div>
                <button class="btn-add-recommendation" data-product-id="${product.id}">+</button>
            `;
            recommendationContainer.appendChild(recItem);
            
            // PËRMIRËSIMI: Shtimi i event listener me funksionin e përmirësuar
            const addBtn = recItem.querySelector('.btn-add-recommendation');
            addBtn.addEventListener('click', function() {
                const productToAdd = {...product, quantity: 1};
                addToCart(productToAdd);
                
                // NDRYSHIMI KRYESOR: Përditëso të gjithë UI-n pas shtimit
                updateFullCheckoutUI();
                
                // Trego njoftim të suksesshëm
                showNotification(`${product.name} u shtua në shportë!`, 'success');
            });
        });
    } else {
        recommendationContainer.innerHTML = '<p>Nuk ka produkte të rekomanduara.</p>';
    }
}

// Funksion i ri për përditësimin e plotë të UI
function updateFullCheckoutUI() {
    console.log("Updating full checkout UI");
    
    // Përditëso shportën
    updateCartUI();
    
    // Përditëso përmbledhjen e porosisë
    if (document.getElementById('order-items-summary')) {
        updateOrderSummaries();
    }
    
    // Përditëso përmbledhjen e pagesës
    if (document.getElementById('payment-summary-details')) {
        updatePaymentSummary();
    }
    
    // Përditëso numëruesin e artikujve
    updateCartCount();
}