let componentsLoaded = false; // Flag to prevent multiple executions

document.addEventListener('DOMContentLoaded', async function() {
    // Prevent multiple executions
    if (componentsLoaded) return;
    componentsLoaded = true;
    
    // Determine base path for components
    const path = window.location.pathname.toLowerCase();
    const isSubPage = path.includes('/pages/');
    const basePath = isSubPage ? '../components/' : 'components/';
    
    console.log("Loading components with base path:", basePath);
    
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
            
            // Fix navigation links for current page
            if (isSubPage) {
                const homeLink = headerContainer.querySelector('#nav-home');
                if (homeLink) homeLink.setAttribute('href', '/');
                
                const productLink = headerContainer.querySelector('#nav-products');
                if (productLink) productLink.setAttribute('href', '/pages/products');
                
                const aboutLink = headerContainer.querySelector('#nav-about');
                if (aboutLink) aboutLink.setAttribute('href', '/pages/about');
                
                const contactLink = headerContainer.querySelector('#nav-contact');
                if (contactLink) contactLink.setAttribute('href', '/pages/contact');
                
                const cartLink = headerContainer.querySelector('.cart-icon a');
                if (cartLink) cartLink.setAttribute('href', '/pages/checkout');
            } else {
                const productLink = headerContainer.querySelector('#nav-products');
                if (productLink) productLink.setAttribute('href', '/pages/products');
                
                const aboutLink = headerContainer.querySelector('#nav-about');
                if (aboutLink) aboutLink.setAttribute('href', '/pages/about');
                
                const contactLink = headerContainer.querySelector('#nav-contact');
                if (contactLink) contactLink.setAttribute('href', '/pages/contact');
                
                const cartLink = headerContainer.querySelector('.cart-icon a');
                if (cartLink) cartLink.setAttribute('href', '/pages/checkout');
            }
            
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