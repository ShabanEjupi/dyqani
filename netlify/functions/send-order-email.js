/**
 * Netlify Serverless Function: Send Order Email
 * Sends order confirmation emails using Nodemailer with Gmail SMTP
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
    
    // Create transporter using Gmail SMTP with App Password
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || process.env.STORE_EMAIL || 'center.enisi@gmail.com',
        pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4a6da7 0%, #2d4a6f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e0e0e0; }
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .order-info p { margin: 5px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #4a6da7; color: white; padding: 12px 10px; text-align: left; }
        .order-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
        .order-table tr:last-child td { border-bottom: none; }
        .totals-table { width: 100%; margin-top: 20px; }
        .totals-table td { padding: 8px 10px; }
        .totals-table .total-row { font-weight: bold; font-size: 1.2em; background: #f8f9fa; }
        .totals-table .total-row td { padding: 15px 10px; }
        .customer-info { background: #f0f4f8; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .customer-info h3 { margin-top: 0; color: #4a6da7; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
        .footer a { color: #4a6da7; text-decoration: none; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Enisi Center</h1>
            <p>Konfirmimi i Porosisë</p>
        </div>
        
        <div class="content">
            <h2 style="color: #4a6da7;">Faleminderit për porosinë tuaj, ${templateParams.customer_name}!</h2>
            <p>Porosia juaj është pranuar me sukses dhe do të përpunohet së shpejti.</p>
            
            <div class="order-info">
                <p><strong>📋 Numri i porosisë:</strong> ${templateParams.order_number}</p>
                <p><strong>📅 Data:</strong> ${templateParams.order_date}</p>
                <p><strong>💳 Metoda e pagesës:</strong> ${templateParams.payment_method}</p>
            </div>
            
            <h3 style="color: #4a6da7;">Detajet e porosisë:</h3>
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Produkti</th>
                        <th style="text-align: center;">Sasia</th>
                        <th style="text-align: right;">Çmimi</th>
                    </tr>
                </thead>
                <tbody>
                    ${templateParams.items_html}
                </tbody>
            </table>
            
            <table class="totals-table">
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
                    <td style="text-align: right; color: #27ae60;">-${templateParams.discount} €</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td><strong>TOTALI:</strong></td>
                    <td style="text-align: right;"><strong>${templateParams.total} €</strong></td>
                </tr>
            </table>
            
            <div class="customer-info">
                <h3>📍 Adresa e dërgesës:</h3>
                <p><strong>${templateParams.customer_name}</strong></p>
                <p>${templateParams.customer_address}</p>
                <p>📞 ${templateParams.customer_phone}</p>
                <p>✉️ ${templateParams.customer_email}</p>
            </div>
            
            <p style="margin-top: 25px; padding: 15px; background: #e8f4fd; border-radius: 6px; border-left: 4px solid #4a6da7;">
                <strong>ℹ️ Çfarë ndodh tani?</strong><br>
                Do t'ju kontaktojmë kur porosia të jetë gati për dërgesë. Nëse keni pyetje, na kontaktoni në çdo kohë!
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Enisi Center</strong></p>
            <p>Rr. Bedri Bajrami, Nr. 15, Podujevë, Kosovo</p>
            <p>📞 +383 45 594 549 | ✉️ <a href="mailto:info@enisicenter.tech">info@enisicenter.tech</a></p>
            <p><a href="https://enisicenter.tech">www.enisicenter.tech</a></p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email to customer
    const customerMailResult = await transporter.sendMail({
      from: `"Enisi Center" <${process.env.SMTP_USER || 'center.enisi@gmail.com'}>`,
      to: templateParams.to_email,
      subject: `✅ Konfirmimi i porosisë #${templateParams.order_number} - Enisi Center`,
      html: emailHtml
    });

    console.log('Customer email sent:', customerMailResult.messageId);

    // Send notification to admin
    const adminMailResult = await transporter.sendMail({
      from: `"Enisi Center Orders" <${process.env.SMTP_USER || 'center.enisi@gmail.com'}>`,
      to: process.env.STORE_ADMIN_EMAIL || 'shabanejupi@enisicenter.tech',
      subject: `🛒 Porosi e re #${templateParams.order_number} - ${templateParams.total} €`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: #27ae60; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: bold; margin-top: 3px; }
        .total { font-size: 24px; color: #27ae60; }
        .btn { display: inline-block; padding: 12px 24px; background: #4a6da7; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🎉 Porosi e re!</h2>
        </div>
        <div class="content">
            <div class="info-row">
                <div class="label">Numri i porosisë</div>
                <div class="value">${templateParams.order_number}</div>
            </div>
            <div class="info-row">
                <div class="label">Klienti</div>
                <div class="value">${templateParams.customer_name}</div>
            </div>
            <div class="info-row">
                <div class="label">Telefoni</div>
                <div class="value">${templateParams.customer_phone}</div>
            </div>
            <div class="info-row">
                <div class="label">Email</div>
                <div class="value">${templateParams.customer_email}</div>
            </div>
            <div class="info-row">
                <div class="label">Adresa</div>
                <div class="value">${templateParams.customer_address}</div>
            </div>
            <div class="info-row">
                <div class="label">Pagesa</div>
                <div class="value">${templateParams.payment_method}</div>
            </div>
            <div class="info-row">
                <div class="label">Totali</div>
                <div class="value total">${templateParams.total} €</div>
            </div>
            <a href="https://enisicenter.tech/pages/admin.html" class="btn">Shiko në panel</a>
        </div>
    </div>
</body>
</html>
      `
    });

    console.log('Admin notification sent:', adminMailResult.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        customerMessageId: customerMailResult.messageId,
        adminMessageId: adminMailResult.messageId
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
        message: error.message,
        details: error.response || error.code
      })
    };
  }
};
