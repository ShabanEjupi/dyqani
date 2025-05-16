document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer components
    loadComponent('header-container', 'header.html');
    loadComponent('footer-container', 'footer.html');
    
    // Update cart count after components are loaded
    setTimeout(() => {
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }, 100);
});

// Load component into target element
function loadComponent(targetId, componentName) {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    fetch(`../components/${componentName}`)
        .then(response => response.text())
        .then(html => {
            target.innerHTML = html;
            // Dispatch event when component is loaded
            document.dispatchEvent(new CustomEvent('component-loaded', { 
                detail: { id: targetId } 
            }));
        })
        .catch(error => console.error(`Error loading ${componentName}:`, error));
}