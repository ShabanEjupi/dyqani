/**
 * Favicon Setup Script
 * Ensures all favicon links are correctly set up for the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if favicon already exists
    if (!document.querySelector('link[rel="icon"]')) {
        // Create favicon link
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = '../favicon.ico';
        document.head.appendChild(favicon);
        
        // Create apple-touch-icon
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.sizes = '180x180';
        appleTouchIcon.href = '../assets/icons/apple-touch-icon.png';
        document.head.appendChild(appleTouchIcon);
        
        // Create 32x32 favicon
        const favicon32 = document.createElement('link');
        favicon32.rel = 'icon';
        favicon32.type = 'image/png';
        favicon32.sizes = '32x32';
        favicon32.href = '../assets/icons/favicon-32x32.png';
        document.head.appendChild(favicon32);
        
        // Create 16x16 favicon
        const favicon16 = document.createElement('link');
        favicon16.rel = 'icon';
        favicon16.type = 'image/png';
        favicon16.sizes = '16x16';
        favicon16.href = '../assets/icons/favicon-16x16.png';
        document.head.appendChild(favicon16);
        
        // Create manifest link
        const manifest = document.createElement('link');
        manifest.rel = 'manifest';
        manifest.href = '../site.webmanifest';
        document.head.appendChild(manifest);
    }
    
    console.log('Favicon setup complete!');
});