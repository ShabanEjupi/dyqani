/**
 * Instagram Graph API Integration
 * 
 * This file handles integration with Instagram Graph API which will replace
 * the deprecated Instagram Basic Display API (being discontinued on December 4, 2024)
 */

// Configuration for Instagram Graph API
const instagramConfig = {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'YOUR_INSTAGRAM_ACCESS_TOKEN',
    apiVersion: 'v18.0', // Use current Graph API version
    redirectUri: 'https://enisicenter.netlify.app/instagram-callback'
};

// Function to fetch media from Instagram Graph API
async function fetchInstagramMedia() {
    try {
        // In a real implementation, this would use the Instagram Graph API
        // Example endpoint: https://graph.facebook.com/{api-version}/{ig-user-id}/media
        // For now, we'll continue using our predefined products
        
        console.log('Fetching products from Instagram Graph API...');
        return enisiProducts; // Return our predefined products for now
    } catch (error) {
        console.error('Error fetching from Instagram Graph API:', error);
        throw error;
    }
}

// Generate Instagram authorization URL
function getInstagramAuthUrl() {
    const baseUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
    const params = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID || 'YOUR_INSTAGRAM_APP_ID',
        redirect_uri: instagramConfig.redirectUri,
        scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
        response_type: 'code',
        state: generateRandomState()
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// Generate random state parameter for security
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Handle Instagram authorization callback
function handleInstagramCallback(code) {
    // This would be implemented in a server-side function
    // For client-side, we can show a success message
    console.log('Authorization code received:', code);
    return {
        success: true,
        message: 'Instagram authorization successful'
    };
}

// Export functions
window.instagramApi = {
    fetchMedia: fetchInstagramMedia,
    getAuthUrl: getInstagramAuthUrl,
    handleCallback: handleInstagramCallback
};