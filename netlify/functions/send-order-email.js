/**
 * Netlify Serverless Function: Send Order Email
 * Sends order confirmation emails using Nodemailer
 */

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { orderData, templateParams } = JSON.parse(event.body);
    
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'info@enisicenter.tech',
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a6da7; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th, .order-table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        .order-table th { background: #f0f0f0; }
        .total-row { font-weight: bold; font-size: 1.1em; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Enisi Center</h1>
            <p>Konfirmimi i Porosisë</p>
        </div>
        
        <div class="content">
            <h2>Faleminderit për porosinë tuaj, ${templateParams.customer_name}!</h2>
            
            <p><strong>Numri i porosisë:</strong> ${templateParams.order_number}</p>
            <p><strong>Data:</strong> ${templateParams.order_date}</p>
            
            <h3>Detajet e porosisë:</h3>
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Produkti</th>
                        <th>Sasia</th>
                        <th>Çmimi</th>
                    </tr>
                </thead>
                <tbody>
                    ${templateParams.items_html}
                </tbody>
            </table>
            
            <table class="order-table">
                <tr>
                    <td>Nëntotali:</td>
                    <td style="text-align: right;">${templateParams.subtotal} €</td>
                </tr>
                <tr>
                    <td>Transport:</td>
                    <td style="text-align: right;">${templateParams.shipping} €</td>
                </tr>
                ${parseFloat(templateParams.discount) > 0 ? `
                <tr>
                    <td>Zbritja:</td>
                    <td style="text-align: right;">-${templateParams.discount} €</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td>TOTALI:</td>
                    <td style="text-align: right;">${templateParams.total} €</td>
                </tr>
            </table>
            
            <h3>Adresa e dërgesës:</h3>
            <p>${templateParams.customer_address}</p>
            
            <h3>Metoda e pagesës:</h3>
            <p>${templateParams.payment_method}</p>
            
            <p>Nëse keni pyetje, na kontaktoni në <a href="mailto:info@enisicenter.tech">info@enisicenter.tech</a> ose telefononi në +383 45 594 549.</p>
        </div>
        
        <div class="footer">
            <p>Enisi Center - Rr. Bedri Bajrami, Nr. 15, Podujevë, Kosovo</p>
            <p>Tel: +383 45 594 549 | Email: info@enisicenter.tech</p>
            <p><a href="https://enisicenter.tech">www.enisicenter.tech</a></p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email to customer
    await transporter.sendMail({
      from: '"Enisi Center" <info@enisicenter.tech>',
      to: templateParams.to_email,
      subject: `Konfirmimi i porosisë #${templateParams.order_number} - Enisi Center`,
      html: emailHtml
    });

    // Send notification to admin
    await transporter.sendMail({
      from: '"Enisi Center Orders" <info@enisicenter.tech>',
      to: 'shabanejupi@enisicenter.tech',
      subject: `Porosi e re #${templateParams.order_number} - ${templateParams.total} €`,
      html: `
        <h2>Porosi e re është pranuar!</h2>
        <p><strong>Numri:</strong> ${templateParams.order_number}</p>
        <p><strong>Klienti:</strong> ${templateParams.customer_name}</p>
        <p><strong>Telefoni:</strong> ${templateParams.customer_phone}</p>
        <p><strong>Email:</strong> ${templateParams.customer_email}</p>
        <p><strong>Totali:</strong> ${templateParams.total} €</p>
        <p><strong>Pagesa:</strong> ${templateParams.payment_method}</p>
        <p><a href="https://enisicenter.tech/pages/admin.html">Shiko në panel</a></p>
      `
    });

    console.log('Order confirmation emails sent successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Emails sent successfully'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send email',
        message: error.message
      })
    };
  }
};
