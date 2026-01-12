/**
 * Netlify Serverless Function: Send Contact Form Email
 * Sends contact form submissions via Gmail SMTP and saves to database
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
    const { name, email, phone, reason, message } = JSON.parse(event.body);
    
    console.log('Received contact form submission:', { name, email, phone, reason });

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: name, email, and message are required' 
        })
      };
    }
    
    // Log SMTP config (without password)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || 'center.enisi@gmail.com',
      hasPassword: !!(process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD)
    });

    // Create transporter using Gmail SMTP with App Password
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || 'center.enisi@gmail.com',
        pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Map reason to Albanian
    const reasonMap = {
      'question': 'Pyetje për produkte',
      'order': 'Informata për porosi',
      'return': 'Kthim/zëvendësim',
      'complaint': 'Ankesë',
      'collaboration': 'Bashkëpunim',
      'other': 'Tjetër'
    };

    const reasonText = reasonMap[reason] || reason || 'Kontakt i përgjithshëm';

    // Build email HTML for admin notification
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4a6da7 0%, #2d4a6f 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 25px; background: #ffffff; border: 1px solid #e0e0e0; }
        .info-row { padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 15px; margin-top: 4px; }
        .message-box { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #4a6da7; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        .reply-btn { display: inline-block; padding: 12px 24px; background: #4a6da7; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Mesazh i ri nga faqja e kontaktit</h1>
        </div>
        
        <div class="content">
            <div class="info-row">
                <div class="label">Emri</div>
                <div class="value">${name}</div>
            </div>
            <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="info-row">
                <div class="label">Telefoni</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            <div class="info-row">
                <div class="label">Arsyeja</div>
                <div class="value">${reasonText}</div>
            </div>
            
            <div class="message-box">
                <div class="label">Mesazhi</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
            </div>
            
            <center>
                <a href="mailto:${email}?subject=Re: Mesazhi juaj në Enisi Center" class="reply-btn">
                    Përgjigju në email
                </a>
            </center>
        </div>
        
        <div class="footer">
            <p>Ky mesazh u dërgua nga forma e kontaktit në enisicenter.tech</p>
        </div>
    </div>
</body>
</html>
    `;

    // Build auto-reply email for customer
    const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4a6da7 0%, #2d4a6f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e0e0e0; }
        .highlight { background: #e8f4fd; padding: 15px; border-radius: 6px; border-left: 4px solid #4a6da7; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
        .footer a { color: #4a6da7; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Enisi Center</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Faleminderit që na kontaktuat!</p>
        </div>
        
        <div class="content">
            <h2 style="color: #4a6da7;">Përshëndetje ${name}!</h2>
            
            <p>Faleminderit që na kontaktuat. Kemi marrë mesazhin tuaj dhe do t'ju përgjigjemi sa më shpejt që të jetë e mundur, zakonisht brenda 24 orëve.</p>
            
            <div class="highlight">
                <strong>📝 Mesazhi juaj:</strong><br>
                <p style="white-space: pre-wrap; margin: 10px 0 0;">${message}</p>
            </div>
            
            <p>Nëse keni nevojë për ndihmë urgjente, mund të na kontaktoni drejtpërdrejt:</p>
            <ul>
                <li>📞 Telefon: <a href="tel:+38345594549">+383 45 594 549</a></li>
                <li>📧 Email: <a href="mailto:info@enisicenter.tech">info@enisicenter.tech</a></li>
            </ul>
            
            <p>Me respekt,<br><strong>Ekipi i Enisi Center</strong></p>
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

    // Send email to admin
    const adminMailResult = await transporter.sendMail({
      from: `"Enisi Center Contact" <${process.env.SMTP_USER || 'center.enisi@gmail.com'}>`,
      to: process.env.STORE_ADMIN_EMAIL || 'shabanejupi@enisicenter.tech',
      replyTo: email,
      subject: `📬 Mesazh i ri: ${reasonText} - ${name}`,
      html: adminEmailHtml
    });

    console.log('Admin notification sent:', adminMailResult.messageId);

    // Send auto-reply to customer
    const customerMailResult = await transporter.sendMail({
      from: `"Enisi Center" <${process.env.SMTP_USER || 'center.enisi@gmail.com'}>`,
      to: email,
      subject: `Faleminderit që na kontaktuat - Enisi Center`,
      html: customerEmailHtml
    });

    console.log('Customer auto-reply sent:', customerMailResult.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        adminMessageId: adminMailResult.messageId,
        customerMessageId: customerMailResult.messageId
      })
    };

  } catch (error) {
    console.error('Error sending contact email:', error);
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
