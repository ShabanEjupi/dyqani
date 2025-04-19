/**
 * Instagram Image Cache
 * This script helps load Instagram images by providing permanent URLs
 */

// Now that all pages are in the pages directory, use the same path for all
const basePath = '../assets/icons/';

const instagramImageCache = {
    'https://www.instagram.com/p/DC9njmdIeNT/': basePath + 'product1.png',
    'https://www.instagram.com/p/DC9oeeXsIxD/': basePath + 'product2.png',
    'https://www.instagram.com/p/DDrbMUTohRm/': basePath + 'product3.png',
    'https://www.instagram.com/p/DE2H4BGqEy9/': basePath + 'product4.png',
    'https://www.instagram.com/p/DE2IdJ5qub5/': basePath + 'product5.png',
    'https://www.instagram.com/p/DE2Jy0NKbLi/': basePath + 'product6.png',
    'https://www.instagram.com/p/DE2KF1RK7yK/': basePath + 'product7.png',
    'https://www.instagram.com/p/DC9khPuIaql/': basePath + 'product8.png'
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