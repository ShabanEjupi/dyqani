const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event) {
  // Get the Instagram URL from query parameters
  const instagramUrl = event.queryStringParameters.url;
  
  if (!instagramUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Instagram URL is required' })
    };
  }
  
  try {
    // Fetch the Instagram post page
    const response = await axios.get(instagramUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract image URLs - this pattern matches Instagram's structure as of April 2025
    // We look for the meta og:image tag which typically contains the high-res image
    const imageUrl = $('meta[property="og:image"]').attr('content');
    
    if (!imageUrl) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }
    
    // Return the image URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        imageUrl: imageUrl,
        sourceUrl: instagramUrl
      })
    };
  } catch (error) {
    console.error('Error fetching Instagram image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Instagram image' })
    };
  }
};