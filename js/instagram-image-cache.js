/**
 * Instagram Image Cache
 * This script helps load Instagram images by providing permanent URLs
 */

// Cached versions of the Instagram images (these won't expire)
const instagramImageCache = {
    'https://www.instagram.com/p/DC9njmdIeNT/': 'https://i.imgur.com/Qv1RXW0.jpg',
    'https://www.instagram.com/p/DC9oeeXsIxD/': 'https://i.imgur.com/w4tnSKf.jpg',
    'https://www.instagram.com/p/DDrbMUTohRm/': 'https://i.imgur.com/YUKY3Pt.jpg',
    'https://www.instagram.com/p/DE2H4BGqEy9/': 'https://i.imgur.com/6JfKThx.jpg',
    'https://www.instagram.com/p/DE2IdJ5qub5/': 'https://i.imgur.com/nLgdwo1.jpg',
    'https://www.instagram.com/p/DE2Jy0NKbLi/': 'https://i.imgur.com/d7YNXyD.jpg',
    'https://www.instagram.com/p/DE2KF1RK7yK/': 'https://i.imgur.com/xudcomZ.jpg',
    'https://www.instagram.com/p/DC9khPuIaql/': 'https://i.imgur.com/Ltz3oNJ.jpg'
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