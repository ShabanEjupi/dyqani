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
    // Butonat e navigimit të hapave
    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const nextToStep4 = document.getElementById('next-to-step-4');
    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    
    // Elementet e hapave
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const step3 = document.getElementById('checkout-step-3');
    const step4 = document.getElementById('checkout-step-4');
    const progressSteps = document.querySelectorAll('.progress-step');

    // Navigimi përpara
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            console.log("Next to step 2 clicked, cart:", cart);
            if (!cart || cart.length === 0) {
                showNotification('Shporta është bosh! Ju lutemi shtoni produkte para se të vazhdoni.');
                return;
            }
            goToStep(2);
        });
    }

    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            const customerForm = document.getElementById('customer-info-form');
            if (customerForm && !customerForm.checkValidity()) {
                customerForm.reportValidity();
                return;
            }
            updatePaymentSummary();
            goToStep(3);
        });
    }

    if (nextToStep4) {
        nextToStep4.addEventListener('click', function() {
            console.log("Completing order button clicked");
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            
            const paymentMethodValue = selectedPayment.value;
            console.log('Metoda e pagesës:', paymentMethodValue);
            
            const orderSummary = generateOrderSummary();
            console.log("Generated order summary:", orderSummary);
            
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            
            orderSummary.paymentMethod = paymentMethodValue;

            // Ruaj përmbledhjen për faturën
            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));
            console.log("Stored order summary in sessionStorage");

            // Përditëso të dhënat e konfirmimit
            updateConfirmationDetails(orderSummary, paymentMethodValue);
            
            // Aktivizo hapin 4
            goToStep(4);
            
            // Pastro shportën vetëm pasi të kemi kaluar në hapin 4
            cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
            
            console.log("Order completed successfully");
        });
    }

    // Navigimi prapa
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

    // Funksioni i navigimit
    function goToStep(step) {
        console.log("Navigating to step:", step);
        
        [step1, step2, step3, step4].forEach(s => {
            if (s) s.classList.remove('active');
        });
        
        // Përditëso indikatorët e progresit
        progressSteps.forEach((s, index) => {
            if (s) {
                s.classList.remove('active', 'completed');
                if (index < step - 1) {
                    s.classList.add('completed');
                } else if (index === step - 1) {
                    s.classList.add('active');
                }
            }
        });
        
        // Shfaq hapin e zgjedhur
        const currentStep = document.getElementById(`checkout-step-${step}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // Scroll në krye të seksionit të checkout
        window.scrollTo({
            top: document.querySelector('.checkout-progress').offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    // Bëje goToStep të disponueshëm jashtë funksionit
    window.goToStep = goToStep;
}

// Inicializimi i funksionalitetit të kodit promocional
function initCouponCode() {
    const couponInput = document.getElementById('coupon-code');
    const applyButton = document.getElementById('apply-coupon');
    
    if (!couponInput || !applyButton) return; // Këtu mungonte return
    
    // Dëgjuesi i ngjarjeve për butonin "Apliko"
    applyButton.addEventListener('click', function() {
        applyCouponCode(couponInput.value);
    });
    
    // Gjithashtu apliko kodin kur shtypet Enter
    couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyCouponCode(couponInput.value);
        }
    });
    
    // Kontrollo nëse ekziston ndonjë kupon i aplikuar
    const existingCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    if (existingCoupon) {
        couponInput.value = existingCoupon.code;
        couponInput.classList.add('coupon-valid');
        couponInput.disabled = true;
        applyButton.textContent = 'Hiq';
    }
}

// ===== KODI I RI PËR TË RREGULLUAR APLIKIMET E KUPONAVE =====

// Funksioni për aplikimin e kodit promocional
function applyCouponCode(code) {
    console.log("Applying coupon code:", code);
    const couponInput = document.getElementById('coupon-code');
    const applyButton = document.getElementById('apply-coupon');
    
    if (!couponInput || !applyButton) return;
    
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
    
    // Normalizimi i kodit
    const normalizedCode = code.trim().toUpperCase();
    
    // Kontrollo veprimin heqje/aplikim
    const isRemoveAction = applyButton.textContent.trim() === 'Hiq';
    
    if (isRemoveAction) {
        // HEQJE E KUPONIT
        console.log("Removing existing coupon");
        sessionStorage.removeItem('appliedCoupon');
        couponInput.value = '';
        couponInput.classList.remove('coupon-valid');
        couponInput.classList.remove('coupon-invalid');
        couponInput.disabled = false;
        applyButton.textContent = 'Apliko';
        
        // Përditëso përmbledhjet e porosisë
        updateOrderSummaries();
        
        showNotification('Kodi promocional u hoq me sukses.', 'info');
        return;
    }
    
    // SHTIM I KUPONIT TË RI
    
    if (normalizedCode === '') {
        showNotification('Ju lutemi shkruani një kod promocional.');
        return;
    }
    
    if (validCoupons[normalizedCode]) {
        // Kodi është i vlefshëm
        const coupon = {
            code: normalizedCode,
            ...validCoupons[normalizedCode]
        };
        
        console.log("Valid coupon found:", coupon);
        
        // Ruaj kuponin në sessionStorage
        sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        
        // Krijo mesazhin e suksesit
        let successMessage = '';
        if (coupon.type === 'percent') {
            successMessage = `Kodi promocional ${normalizedCode} u aplikua me sukses. ${coupon.description}.`;
        } else if (coupon.type === 'shipping') {
            successMessage = 'Kodi promocional u aplikua. Dërgesa juaj është falas!';
        }
        
        // Përditëso UI
        couponInput.classList.add('coupon-valid');
        couponInput.classList.remove('coupon-invalid');
        couponInput.disabled = true;
        applyButton.textContent = 'Hiq';
        
        // Përditëso përmbledhjen e porosisë me zbritjen
        updateOrderSummaries();
        
        showNotification(successMessage, 'success');
    } else {
        // Kodi nuk është i vlefshëm
        couponInput.classList.add('coupon-invalid');
        couponInput.classList.remove('coupon-valid');
        showNotification('Kodi promocional nuk është i vlefshëm.', 'error');
    }
}

// Rregulimi i funksionit të përmbledhjes
function updateOrderSummaries() {
    console.log("Updating order summaries");
    // Merr përmbledhjen e porosisë në hapin 1
    const orderItemsSummary = document.getElementById('order-items-summary');
    if (!orderItemsSummary) return;
    
    // Sigurohu që kemi artikuj në shportë
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        orderItemsSummary.innerHTML = '<p class="empty-cart">Shporta juaj është bosh</p>';
        return;
    }
    
    // Llogarit nëntotalin
    let subtotal = 0;
    cart.forEach(item => {
        console.log(`Item ${item.name}: price=${item.price}, quantity=${item.quantity}, total=${item.price * item.quantity}`);
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
        console.log("Processing coupon:", appliedCoupon);
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

// Funksioni i përmirësuar për të përfunduar porosinë
function initCheckoutSteps() {
    // Butonat e navigimit të hapave
    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const nextToStep4 = document.getElementById('next-to-step-4');
    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    
    // Elementet e hapave
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const step3 = document.getElementById('checkout-step-3');
    const step4 = document.getElementById('checkout-step-4');
    const progressSteps = document.querySelectorAll('.progress-step');

    // Navigimi përpara
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            console.log("Next to step 2 clicked, cart:", cart);
            if (!cart || cart.length === 0) {
                showNotification('Shporta është bosh! Ju lutemi shtoni produkte para se të vazhdoni.');
                return;
            }
            goToStep(2);
        });
    }

    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            const customerForm = document.getElementById('customer-info-form');
            if (customerForm && !customerForm.checkValidity()) {
                customerForm.reportValidity();
                return;
            }
            updatePaymentSummary();
            goToStep(3);
        });
    }

    if (nextToStep4) {
        nextToStep4.addEventListener('click', function() {
            console.log("Completing order button clicked");
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Ju lutemi zgjidhni një metodë pagese.');
                return;
            }
            
            const paymentMethodValue = selectedPayment.value;
            console.log('Metoda e pagesës:', paymentMethodValue);
            
            const orderSummary = generateOrderSummary();
            console.log("Generated order summary:", orderSummary);
            
            if (!orderSummary) {
                showNotification('Gabim gjatë gjenerimit të përmbledhjes së porosisë.');
                return;
            }
            
            orderSummary.paymentMethod = paymentMethodValue;

            // Ruaj përmbledhjen për faturën
            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));
            console.log("Stored order summary in sessionStorage");

            // Përditëso të dhënat e konfirmimit
            updateConfirmationDetails(orderSummary, paymentMethodValue);
            
            // Aktivizo hapin 4
            goToStep(4);
            
            // Pastro shportën vetëm pasi të kemi kaluar në hapin 4
            cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
            
            console.log("Order completed successfully");
        });
    }

    // Navigimi prapa
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

    // Funksioni i navigimit
    function goToStep(step) {
        console.log("Navigating to step:", step);
        
        [step1, step2, step3, step4].forEach(s => {
            if (s) s.classList.remove('active');
        });
        
        // Përditëso indikatorët e progresit
        progressSteps.forEach((s, index) => {
            if (s) {
                s.classList.remove('active', 'completed');
                if (index < step - 1) {
                    s.classList.add('completed');
                } else if (index === step - 1) {
                    s.classList.add('active');
                }
            }
        });
        
        // Shfaq hapin e zgjedhur
        const currentStep = document.getElementById(`checkout-step-${step}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // Scroll në krye të seksionit të checkout
        window.scrollTo({
            top: document.querySelector('.checkout-progress').offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    // Bëje goToStep të disponueshëm jashtë funksionit
    window.goToStep = goToStep;
}

// Gjenerimi i saktë i përmbledhjes së porosisë
function generateOrderSummary() {
    console.log("Generating order summary, cart:", cart);
    
    // Të sigurohemi që shporta ekziston dhe ka artikuj
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        console.error("Cart is empty or invalid");
        return null;
    }

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

    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                          { name: 'standard', price: 2.00, description: 'Dërgesa standarde' };
    
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon')) || null;

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

    const total = subtotal - discountAmount + shippingPrice;
    const orderId = 'EC' + Date.now().toString().slice(-8);

    // Merr informacionin e blerësit nga formulari (Hapi 2)
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
            name: deliveryOption.name || deliveryOption.description,
            price: parseFloat(shippingPrice.toFixed(2))
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
        paymentMethod: ''
    };
}

// ===== FUNKSIONE NDIHMËSE =====

// Shfaqja e notifikimeve
function showNotification(message, type = 'info', duration = 3000) {
    // Krijimi i elementit të notifikimit nëse nuk ekziston
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Vendosja e mesazhit dhe shfaqja
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Fshihe pas kohës së caktuar
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Funksioni për përmbledhjet e porosisë
function updateOrderSummaries() {
    // Merr përmbledhjen e porosisë në hapin 1
    const orderItemsSummary = document.getElementById('order-items-summary');
    if (!orderItemsSummary) return;
    
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
    
    // Merr opsionin e transportit
    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                         { name: 'standard', price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    
    // Merr kuponin e aplikuar
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    // Llogarit zbritjen
    let discountAmount = 0;
    let shippingPrice = deliveryOption.price;
    
    // NDRYSHIM KRITIK: Llogarit zbritjet saktë
    if (appliedCoupon) {
        console.log("Aplikimi i kuponit:", appliedCoupon);
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
            console.log("Zbritja e llogaritur:", discountAmount);
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.discount;
        } else if (appliedCoupon.type === 'shipping' && appliedCoupon.discount === 'free') {
            shippingPrice = 0;
        }
    }
    
    // Llogarit totalin
    const total = subtotal - discountAmount + shippingPrice;
    
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

// Përditëso përmbledhjen e pagesës në hapin 3
function updatePaymentSummary() {
    const paymentSummaryDetails = document.getElementById('payment-summary-details');
    if (!paymentSummaryDetails) return;
    
    // Sigurohu që kemi artikuj në shportë
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        paymentSummaryDetails.innerHTML = '<p class="empty-cart">Shporta juaj është bosh</p>';
        return;
    }
    
    // Llogarit nëntotalin
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Merr opsionin e transportit
    const deliveryOption = JSON.parse(sessionStorage.getItem('deliveryOption')) || 
                          { name: 'standard', price: 2.00, description: 'Dërgesa standarde (2-3 ditë pune)' };
    
    // Merr kuponin e aplikuar
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    
    // Llogarit zbritjen
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.discount;
        }
        discountAmount = Math.min(discountAmount, subtotal);
    }
    
    // Llogarit çmimin e transportit
    let shippingPrice = deliveryOption.price;
    
    // Kontrollo nëse kuponi ofron transport falas
    if (appliedCoupon && appliedCoupon.type === 'shipping' && appliedCoupon.discount === 'free') {
        shippingPrice = 0;
    }
    
    // Llogarit totalin
    const total = subtotal - discountAmount + shippingPrice;
    
    // Përditëso përmbledhjen e pagesës
    let summaryHTML = `
        <div class="payment-customer-info">
            <h4>Të dhënat e blerësit</h4>
            <p><strong>Emri:</strong> ${document.getElementById('fullname')?.value || 'N/A'}</p>
            <p><strong>Email:</strong> ${document.getElementById('email')?.value || 'N/A'}</p>
            <p><strong>Telefoni:</strong> ${document.getElementById('phone')?.value || 'N/A'}</p>
            <p><strong>Adresa:</strong> ${document.getElementById('address')?.value || 'N/A'}, ${document.getElementById('city')?.value || 'N/A'}</p>
        </div>
        
        <div class="payment-delivery-info">
            <h4>Metoda e dërgesës</h4>
            <p>${deliveryOption.description}</p>
            <p><strong>Data e pritshme:</strong> ${getDeliveryEstimate(deliveryOption.name)}</p>
        </div>
        
        <div class="payment-price-summary">
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
        } else {
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
            <span>Transporti:</span>
            <span>${shippingPrice.toFixed(2)} €</span>
        </div>
        <div class="summary-item total">
            <span>TOTALI:</span>
            <span>${total.toFixed(2)} €</span>
        </div>
    </div>
    `;
    
    paymentSummaryDetails.innerHTML = summaryHTML;
    
    // Përditëso totalet për secilën metodë pagese
    document.getElementById('cash-payment-total').textContent = total.toFixed(2);
    document.getElementById('paypal-payment-total').textContent = total.toFixed(2);
    document.getElementById('bank-payment-total').textContent = total.toFixed(2);
}