// Example for email service
const EmailService = {
    // Your email credentials
    credentials: {
        email: 'info@enisicenter.tech',
        adminEmail: 'shabanejupi@enisicenter.tech',
        appPassword: process.env.EMAIL_APP_PASSWORD
    },
    
    init: function() {
        // No need to load from ENV anymore, it's injected at build time
        console.log('Email service initialized');
    },
    
    // ...rest of the service...
}