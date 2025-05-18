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
        
        // Inicializimi i rekomandimeve
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
            
            console.log('Përmbledhja e porosisë:', orderSummary);
            orderSummary.paymentMethod = paymentMethodValue;

            // Ruaj për faturë
            sessionStorage.setItem('currentOrderSummaryForInvoice', JSON.stringify(orderSummary));

            // Përditëso detajet e konfirmimit
            updateConfirmationDetails(orderSummary, paymentMethodValue);

            if (paymentMethodValue === 'paypal') {
                redirectToPayPal(orderSummary);
            } else {
                goToStep(4);
                // Pastro shportën vetëm PASI përmbledhja e porosisë është ruajtur
                cart = [];
                localStorage.setItem('cart', JSON.stringify([]));
                updateCartCount();
            }
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

// Përditësimi i detajeve të konfirmimit
function updateConfirmationDetails(orderSummary, paymentMethodValue) {
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
}

// Gjenerimi i përmbledhjes së porosisë
function generateOrderSummary() {
    console.log("Generating order summary, cart:", cart);
    
    // PIKË KYÇ: Të sigurohemi që shporta ekziston dhe ka artikuj
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        console.error("Cart is empty or invalid in generateOrderSummary");
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
                          { name: 'Standard', price: 2.00, description: 'Dërgesa standarde' };
    
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon')) || null;

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * appliedCoupon.discount;
        } else {
            discountAmount = appliedCoupon.discount;
        }
        discountAmount = Math.min(discountAmount, subtotal);
    }

    const total = subtotal - discountAmount + deliveryOption.price;
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
        paymentMethod: '' // Do të vendoset nga handleri i klikimit
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

// ...dhe funksionet tjera ndihmëse nga checkout.js...