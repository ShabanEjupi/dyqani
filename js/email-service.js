// Example for email service
const EmailService = {
    // Your Gmail credentials from app password
    credentials: {
        email: 'center.enisi@gmail.com',
        appPassword: process.env.GMAIL_APP_PASSWORD
    },
    
    init: function() {
        // No need to load from ENV anymore, it's injected at build time
        console.log('Email service initialized');
    },
    
    // ...rest of the service...
}