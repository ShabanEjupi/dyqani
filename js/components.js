document.addEventListener('DOMContentLoaded', async function() {
    // Load header
    const headerContainer = document.querySelector('#header-container');
    if (headerContainer) {
        try {
            const headerResponse = await fetch('/components/header.html');
            const headerHtml = await headerResponse.text();
            headerContainer.innerHTML = headerHtml;
            
            // Highlight active navigation link
            const currentPath = window.location.pathname;
            if (currentPath.includes('products.html')) {
                document.getElementById('nav-products').classList.add('active');
            } else if (currentPath.includes('checkout.html')) {
                document.getElementById('nav-cart').classList.add('active');
            } else if (currentPath.includes('about.html')) {
                document.getElementById('nav-about').classList.add('active');
            } else if (currentPath.includes('contact.html')) {
                document.getElementById('nav-contact').classList.add('active');
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                document.getElementById('nav-home').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }
    
    // Load footer
    const footerContainer = document.querySelector('#footer-container');
    if (footerContainer) {
        try {
            const footerResponse = await fetch('/components/footer.html');
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