// Simplified components loader to prevent infinite loops

// Global flag to prevent multiple executions
let componentsLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple executions
    if (componentsLoaded) {
        console.log("Components already loaded, skipping");
        return;
    }
    componentsLoaded = true;
    
    console.log("Loading components...");
    
    // Load header
    loadComponent('header-container', '../components/header.html', function() {
        // Fix navigation links after header is loaded
        updateNavigationLinks();
    });
    
    // Load footer
    loadComponent('footer-container', '../components/footer.html', function() {
        // Update copyright year after footer is loaded
        updateCopyrightYear();
    });
});

// Function to load a component with timeout and error handling
function loadComponent(containerId, componentPath, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    console.log(`Loading ${componentPath} into #${containerId}`);
    
    // Create a timeout to prevent hanging
    const timeoutId = setTimeout(function() {
        console.error(`Loading ${componentPath} timed out!`);
        container.innerHTML = `<div class="error">Failed to load component</div>`;
    }, 3000);
    
    // Load the component
    fetch(componentPath)
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`Failed to load ${componentPath}: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            if (typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error(`Error loading ${componentPath}:`, error);
            container.innerHTML = `<div class="error">Failed to load component</div>`;
        });
}

// Update navigation links based on current page
function updateNavigationLinks() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a');
    if (!navLinks.length) return;
    
    // Determine if we're in a subdirectory
    const isInPagesDir = window.location.pathname.includes('/pages/');
    
    // Update each link
    navLinks.forEach(link => {
        const originalHref = link.getAttribute('href');
        
        // Skip external links
        if (originalHref.startsWith('http')) return;
        
        // Update links based on current location
        if (isInPagesDir) {
            // We're in the pages directory, keep relative links simple
            if (originalHref === '/') {
                link.setAttribute('href', '../pages/index');
            } else if (originalHref.startsWith('/pages/')) {
                const page = originalHref.replace('/pages/', '');
                link.setAttribute('href', page);
            }
        }
    });
    
    // Also fix cart icon link specifically
    const cartLink = document.querySelector('.cart-icon a');
    if (cartLink && isInPagesDir) {
        cartLink.setAttribute('href', 'checkout');
    }
}

// Update copyright year in footer
function updateCopyrightYear() {
    const yearEl = document.querySelector('.footer-bottom p');
    if (yearEl) {
        const year = new Date().getFullYear();
        yearEl.innerHTML = yearEl.innerHTML.replace(/\d{4}/, year);
    }
}