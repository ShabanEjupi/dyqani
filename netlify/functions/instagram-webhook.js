// Netlify Function: Instagram Webhook Handler
const crypto = require('crypto');

exports.handler = async function(event, context) {
  console.log('Received webhook request:', event.httpMethod);
  
  // 1. Handle Verification Request (GET request from Meta to verify your endpoint)
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters;
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];
    
    console.log('Verification request received with parameters:', { mode, token });
    
    // Load verify token from environment variable
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
    
    if (!verifyToken) {
      console.error('INSTAGRAM_WEBHOOK_VERIFY_TOKEN environment variable is not set');
      return {
        statusCode: 500,
        body: 'Verification token not configured'
      };
    }
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      return {
        statusCode: 200,
        body: challenge
      };
    } else {
      console.error('Webhook verification failed. Invalid token or mode');
      return {
        statusCode: 403,
        body: 'Verification failed'
      };
    }
  }
  
  // 2. Handle Webhook Updates (POST request with event data)
  if (event.httpMethod === 'POST') {
    try {
      // Verify the signature if needed (recommended for production)
      const appSecret = process.env.INSTAGRAM_APP_SECRET;
      const signature = event.headers['x-hub-signature-256'] || 
                        event.headers['X-Hub-Signature-256'];
      
      if (appSecret && signature) {
        // Get raw body for signature verification
        const rawBody = event.body;
        
        // Verify signature
        const expectedSignature = 'sha256=' + 
          crypto.createHmac('sha256', appSecret)
            .update(rawBody)
            .digest('hex');
            
        if (signature !== expectedSignature) {
          console.error('Invalid signature');
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Invalid signature' })
          };
        }
        
        console.log('Signature verified successfully');
      } else {
        console.warn('Signature verification skipped - missing secret or signature');
      }
      
      // Parse the webhook data
      const data = JSON.parse(event.body);
      console.log('Webhook data received:', JSON.stringify(data));
      
      // Here you would process the webhook data based on the entry and changes
      // For example, update your database with new Instagram posts
      
      // For now, just log it and send a success response
      return {
        statusCode: 200,
        body: 'EVENT_RECEIVED'
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error processing webhook' })
      };
    }
  }
  
  // Handle other HTTP methods
  return {
    statusCode: 405,
    body: 'Method not allowed'
  };
};