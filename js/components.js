document.addEventListener('DOMContentLoaded', async function() {
    // Determine base path for components
    const path = window.location.pathname.toLowerCase();
    const isSubPage = path.includes('/pages/');
    const basePath = isSubPage ? '../components/' : 'components/';
    
    console.log("Loading components with base path:", basePath);
    
    // Load header
    const headerContainer = document.querySelector('#header-container');
    if (headerContainer) {
        try {
            const headerResponse = await fetch(basePath + 'header.html');
            const headerHtml = await headerResponse.text();
            headerContainer.innerHTML = headerHtml;
            
            // Fix navigation links for current page
            if (isSubPage) {
                const homeLink = headerContainer.querySelector('#nav-home');
                if (homeLink) homeLink.setAttribute('href', '../index.html');
                
                const cartLink = headerContainer.querySelector('.cart-icon a');
                if (cartLink) cartLink.setAttribute('href', 'checkout.html');
            } else {
                const cartLink = headerContainer.querySelector('.cart-icon a');
                if (cartLink) cartLink.setAttribute('href', 'pages/checkout.html');
            }
            
            // Update cart count
            if (typeof updateCartCount === 'function') {
                setTimeout(updateCartCount, 100);
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }
    
    // Load footer
    const footerContainer = document.querySelector('#footer-container');
    if (footerContainer) {
        try {
            const footerResponse = await fetch(basePath + 'footer.html');
            const footerHtml = await footerResponse.text();
            footerContainer.innerHTML = footerHtml;
            
            // Update copyright year dynamically
            const currentYear = new Date().getFullYear();
            const copyrightEl = footerContainer.querySelector('.footer-bottom p');
            if (copyrightEl) {
                copyrightEl.innerHTML = copyrightEl.innerHTML.replace('2025', currentYear);
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }
});