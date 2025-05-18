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

// Përditësimi i UI të shportës në faqen e checkout
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
    
    // Përditëso përmbledhjen e shportës
    if (cartSummary) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 2.00 : 0;
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
        `;
    }
    
    // Përditëso përmbledhjet në hapat e checkout-it
    updateOrderSummaries();
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

// Inicializimi i funksionalitetit të kodit promocional
function initCouponCode() {
    console.log("Initializing coupon code functionality");
    
    const couponInput = document.getElementById('coupon-code');
    const applyButton = document.getElementById('apply-coupon');
    
    if (!couponInput || !applyButton) {
        console.error("Coupon elements not found");
        return;
    }
    
    // Apply coupon when button is clicked
    applyButton.addEventListener('click', function() {
        applyCouponCode(couponInput.value);
    });
    
    // Apply coupon when Enter is pressed
    couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyCouponCode(couponInput.value);
        }
    });
    
    // Check for existing coupon in session storage
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
    console.log("PayPal checkout functionality would be initialized here");
    // This would typically integrate with PayPal SDK
}

// Shfaqja e notifikimeve
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