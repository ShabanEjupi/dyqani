/**
 * Email Service for Order Confirmations
 * Uses EmailJS to send order confirmation emails
 */

const EmailService = {
    // EmailJS Configuration
    config: {
        serviceId: 'service_enisicenter',  // Create this in EmailJS dashboard
        templateId: 'template_order_confirm',  // Create this in EmailJS dashboard
        publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'  // Get from EmailJS dashboard
    },
    
    // Store configuration
    store: {
        name: 'Enisi Center',
        email: 'info@enisicenter.tech',
        adminEmail: 'shabanejupi@enisicenter.tech',
        phone: '+383 45 594 549',
        address: 'Rr. Bedri Bajrami, Nr. 15, Podujevë, Kosovo',
        website: 'https://enisicenter.tech'
    },
    
    // Initialize EmailJS
    init: function() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.config.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.warn('EmailJS library not loaded');
        }
    },
    
    // Send order confirmation email to customer
    sendOrderConfirmation: async function(orderData) {
        console.log('Sending order confirmation email...', orderData);
        
        try {
            // Build items HTML for email
            let itemsHtml = '';
            orderData.items.forEach(item => {
                itemsHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} €</td>
                    </tr>
                `;
            });
            
            // Payment method in Albanian
            const paymentMethodText = {
                'cash': 'Para në dorë',
                'paypal': 'PayPal',
                'bank': 'Transfertë bankare'
            }[orderData.paymentMethod] || 'Para në dorë';
            
            // Template parameters for EmailJS
            const templateParams = {
                to_email: orderData.customerInfo.email,
                to_name: orderData.customerInfo.fullname,
                order_number: orderData.orderNumber || orderData.orderId,
                order_date: new Date().toLocaleDateString('sq-AL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                customer_name: orderData.customerInfo.fullname,
                customer_email: orderData.customerInfo.email,
                customer_phone: orderData.customerInfo.phone,
                customer_address: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}`,
                items_html: itemsHtml,
                subtotal: orderData.subtotal.toFixed(2),
                shipping: orderData.shipping.price.toFixed(2),
                discount: orderData.discount ? orderData.discount.toFixed(2) : '0.00',
                total: orderData.total.toFixed(2),
                payment_method: paymentMethodText,
                store_name: this.store.name,
                store_email: this.store.email,
                store_phone: this.store.phone,
                store_address: this.store.address
            };
            
            // Check if EmailJS is available
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.config.serviceId,
                    this.config.templateId,
                    templateParams
                );
                console.log('Email sent successfully:', response);
                return { success: true, response };
            } else {
                // Fallback: Log the email that would be sent
                console.log('EmailJS not available. Email would be sent with:', templateParams);
                
                // Alternative: Send via Netlify function
                return await this.sendViaNetlify(orderData, templateParams);
            }
            
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Send email via Netlify function (fallback)
    sendViaNetlify: async function(orderData, templateParams) {
        try {
            const response = await fetch('/.netlify/functions/send-order-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderData,
                    templateParams
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Netlify email function error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Send notification to admin about new order
    sendAdminNotification: async function(orderData) {
        console.log('Sending admin notification for new order...');
        
        try {
            const templateParams = {
                to_email: this.store.adminEmail,
                order_number: orderData.orderNumber || orderData.orderId,
                customer_name: orderData.customerInfo.fullname,
                customer_phone: orderData.customerInfo.phone,
                total: orderData.total.toFixed(2),
                items_count: orderData.items.length,
                order_link: `${this.store.website}/admin.html?order=${orderData.orderNumber}`
            };
            
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.config.serviceId,
                    'template_admin_notify',  // Separate template for admin
                    templateParams
                );
                console.log('Admin notification sent:', response);
                return { success: true, response };
            }
            
            return { success: false, error: 'EmailJS not available' };
        } catch (error) {
            console.error('Error sending admin notification:', error);
            return { success: false, error: error.message };
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    EmailService.init();
});

// Export for global access
window.EmailService = EmailService;
