/**
 * Instagram Image Cache
 * This script helps load Instagram images by providing permanent URLs
 */

const instagramImageCache = {
    'https://www.instagram.com/p/DC9njmdIeNT/': '../assets/icons/product1.png',
    'https://www.instagram.com/p/DC9oeeXsIxD/': '../assets/icons/product2.png',
    'https://www.instagram.com/p/DDrbMUTohRm/': '../assets/icons/product3.png',
    'https://www.instagram.com/p/DE2H4BGqEy9/': '../assets/icons/product4.png',
    'https://www.instagram.com/p/DE2IdJ5qub5/': '../assets/icons/product5.png',
    'https://www.instagram.com/p/DE2Jy0NKbLi/': '../assets/icons/product6.png',
    'https://www.instagram.com/p/DE2KF1RK7yK/': '../assets/icons/product7.png',
    'https://www.instagram.com/p/DC9khPuIaql/': '../assets/icons/product8.png'
};

/**
 * Get a permanent image URL for an Instagram post
 * @param {string} instagramUrl - The Instagram post URL
 * @returns {string|null} - The permanent image URL or null if not found
 */
function getInstagramImage(instagramUrl) {
    return instagramImageCache[instagramUrl] || null;
}

// Make this function available globally
window.getInstagramImage = getInstagramImage;