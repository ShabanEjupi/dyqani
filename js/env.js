/**
 * Environment Variables
 * This module provides access to environment variables for the application
 */

const ENV = {
    PAYPAL: {
        CLIENT_ID: 'AUlpyjRm4L4cm8Vj3oi9n-kZJxWAKz-vircJRReAXEONIHjy1ksLnzaoMqT0nQ9hxBCNDbwiuw51F9fw',
        CURRENCY: 'EUR',
        INTENT: 'capture'
    },
    STORE: {
        NAME: 'Enisi Center',
        EMAIL: 'center.enisi@gmail.com'
    }
};

// For development use only - don't expose in production
console.log('Environment loaded for: ' + ENV.STORE.NAME);

// Make environment variables available
window.ENV = ENV;