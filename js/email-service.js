/**
 * Email Service for Order Confirmations
 * Sends emails via Netlify function using Google SMTP
 */

const EmailService = {
    // Store configuration
    store: {
        name: 'Enisi Center',
        email: 'info@enisicenter.tech',
        adminEmail: 'shabanejupi@enisicenter.tech',
        phone: '+383 45 594 549',
        address: 'Rr. Bedri Bajrami, Nr. 15, Podujevë, Kosovo',
        website: 'https://enisicenter.tech'
    },
    
    // Initialize
    init: function() {
        console.log('Email service initialized - using Netlify SMTP function');
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
            
            // Template parameters
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
            
            // Send via Netlify function
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
            
            if (result.success) {
                console.log('Confirmation email sent successfully');
                return { success: true };
            } else {
                console.error('Failed to send email:', result.error);
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Send notification to admin about new order
    sendAdminNotification: async function(orderData) {
        console.log('Admin notification will be sent via the same Netlify function');
        // Admin notification is handled in the Netlify function itself
        return { success: true };
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    EmailService.init();
});

// Export for global access
window.EmailService = EmailService;
