let componentsLoaded = false;

document.addEventListener('DOMContentLoaded', async function() {
    if (componentsLoaded) return;
    componentsLoaded = true;
    
    const path = window.location.pathname.toLowerCase();
    let basePath = '../components/';
    
    console.log("Loading components with base path:", basePath);
    
    // Load header
    const headerContainer = document.querySelector('#header-container');
    if (headerContainer) {
        try {
            const headerResponse = await fetch(basePath + 'header.html');
            if (!headerResponse.ok) throw new Error(`Failed to load header: ${headerResponse.status}`);
            
            const headerHtml = await headerResponse.text();
            headerContainer.innerHTML = headerHtml;
            
            // Fix navigation links
            const homeLink = headerContainer.querySelector('#nav-home');
            if (homeLink) homeLink.setAttribute('href', 'home');
            
            const productLink = headerContainer.querySelector('#nav-products');
            if (productLink) productLink.setAttribute('href', 'products');
            
            const checkoutLink = headerContainer.querySelector('#nav-cart');
            if (checkoutLink) checkoutLink.setAttribute('href', 'checkout');
            
            const aboutLink = headerContainer.querySelector('#nav-about');
            if (aboutLink) aboutLink.setAttribute('href', 'aboutus');
            
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
            const footerResponse = await fetch(basePath + 'footer.html');
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