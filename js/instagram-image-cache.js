/**
 * Instagram Image Cache
 * This script helps load Instagram images by providing permanent URLs
 */

// Cached versions of the Instagram images (these won't expire)
const instagramImageCache = {
    'https://www.instagram.com/p/DC9njmdIeNT/': 'https://i.imgur.com/v9YYyPP.jpg',
    'https://www.instagram.com/p/DC9oeeXsIxD/': 'https://i.imgur.com/QTFCNuq.jpg',
    'https://www.instagram.com/p/DDrbMUTohRm/': 'https://i.imgur.com/8bvSnXk.jpg',
    'https://www.instagram.com/p/DE2H4BGqEy9/': 'https://i.imgur.com/h5rQ0NF.jpg',
    'https://www.instagram.com/p/DE2IdJ5qub5/': 'https://i.imgur.com/PCmnb80.jpg',
    'https://www.instagram.com/p/DE2Jy0NKbLi/': 'https://i.imgur.com/LZfCVvn.jpg',
    'https://www.instagram.com/p/DE2KF1RK7yK/': 'https://i.imgur.com/yJpXeuo.jpg',
    'https://www.instagram.com/p/DC9khPuIaql/': 'https://i.imgur.com/j4YoS9K.jpg'
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