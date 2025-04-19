let componentsLoaded = false; // Flag to prevent multiple executions

document.addEventListener('DOMContentLoaded', async function() {
    // Prevent multiple executions
    if (componentsLoaded) return;
    componentsLoaded = true;
    
    // Determine if we're on a page in the pages directory
    const path = window.location.pathname.toLowerCase();
    let basePath = '../components/';
    let isIndexPage = false;
    
    // Set appropriate base path
    if (path.includes('/pages/index') || path === '/pages/') {
        isIndexPage = true;
    }
    
    console.log("Loading components with base path:", basePath, "isIndexPage:", isIndexPage);
    
    // Add a timeout to prevent hanging forever
    const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };
    
    // Load header
    const headerContainer = document.querySelector('#header-container');
    if (headerContainer) {
        try {
            const headerResponse = await fetchWithTimeout(basePath + 'header.html');
            if (!headerResponse.ok) throw new Error(`Failed to load header: ${headerResponse.status}`);
            
            const headerHtml = await headerResponse.text();
            headerContainer.innerHTML = headerHtml;
            
            // Fix navigation links
            const homeLink = headerContainer.querySelector('#nav-home');
            if (homeLink) homeLink.setAttribute('href', isIndexPage ? 'index' : 'index');
            
            const productLink = headerContainer.querySelector('#nav-products');
            if (productLink) productLink.setAttribute('href', 'products');
            
            const checkoutLink = headerContainer.querySelector('#nav-cart');
            if (checkoutLink) checkoutLink.setAttribute('href', 'checkout');
            
            const aboutLink = headerContainer.querySelector('#nav-about');
            if (aboutLink) aboutLink.setAttribute('href', 'about');
            
            const contactLink = headerContainer.querySelector('#nav-contact');
            if (contactLink) contactLink.setAttribute('href', 'contact');
            
            const cartLink = headerContainer.querySelector('.cart-icon a');
            if (cartLink) cartLink.setAttribute('href', 'checkout');
            
        } catch (error) {
            console.error('Error loading header:', error);
            headerContainer.innerHTML = '<header><h1>Mirë se vini në Enisi Center</h1></header>';
        }
    }
    
    // Load footer with similar approach
    const footerContainer = document.querySelector('#footer-container');
    if (footerContainer) {
        try {
            const footerResponse = await fetchWithTimeout(basePath + 'footer.html');
            if (!footerResponse.ok) throw new Error(`Failed to load footer: ${footerResponse.status}`);
            
            const footerHtml = await footerResponse.text();
            footerContainer.innerHTML = footerHtml;
            
        } catch (error) {
            console.error('Error loading footer:', error);
            footerContainer.innerHTML = '<footer><p>&copy; 2025 Enisi Center. Të gjitha të drejtat e rezervuara.</p></footer>';
        }
    }
    
    // Update cart count if function exists
    if (typeof updateCartCount === 'function') {
        setTimeout(updateCartCount, 300);
    }
});