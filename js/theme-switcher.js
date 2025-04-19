/**
 * Theme Switcher
 * Handles dark/light mode functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the theme toggle element
    function createThemeToggle() {
        const headerContainer = document.querySelector('.header-container');
        if (!headerContainer) return;
        
        // Create toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        
        // Create label
        const label = document.createElement('span');
        label.className = 'theme-label';
        label.textContent = 'Tema:';
        
        // Create toggle button
        const toggle = document.createElement('div');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Ndrysho temën');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        
        // Add them to the container
        toggleContainer.appendChild(label);
        toggleContainer.appendChild(toggle);
        
        // Add to header
        headerContainer.appendChild(toggleContainer);
        
        return toggle;
    }
    
    // Function to set theme
    function setTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Wait for the components to load
    setTimeout(function() {
        const toggle = createThemeToggle();
        if (!toggle) return;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply theme based on preference
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setTheme(isDark);
        
        if (isDark) {
            toggle.classList.add('dark');
        }
        
        // Add toggle functionality
        toggle.addEventListener('click', function() {
            const isDarkTheme = document.body.classList.toggle('dark-theme');
            toggle.classList.toggle('dark');
            localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        });
        
        // Make it keyboard accessible
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    }, 500); // Wait for components to load
});