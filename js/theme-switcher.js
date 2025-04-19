/**
 * Theme Switcher - Enhanced version
 * Supports Light, Dark, and Blue themes
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
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'theme-options';
        
        // Create light theme button
        const lightBtn = document.createElement('div');
        lightBtn.className = 'theme-btn theme-btn-light';
        lightBtn.setAttribute('data-theme', 'light');
        lightBtn.setAttribute('title', 'Tema e çelët');
        lightBtn.setAttribute('aria-label', 'Aktivizo temën e çelët');
        
        // Create dark theme button
        const darkBtn = document.createElement('div');
        darkBtn.className = 'theme-btn theme-btn-dark';
        darkBtn.setAttribute('data-theme', 'dark');
        darkBtn.setAttribute('title', 'Tema e errët');
        darkBtn.setAttribute('aria-label', 'Aktivizo temën e errët');
        
        // Create blue theme button
        const blueBtn = document.createElement('div');
        blueBtn.className = 'theme-btn theme-btn-blue';
        blueBtn.setAttribute('data-theme', 'blue');
        blueBtn.setAttribute('title', 'Tema blu special');
        blueBtn.setAttribute('aria-label', 'Aktivizo temën speciale blu');
        
        // Add them to the options container
        optionsContainer.appendChild(lightBtn);
        optionsContainer.appendChild(darkBtn);
        optionsContainer.appendChild(blueBtn);
        
        // Add elements to the toggle container
        toggleContainer.appendChild(label);
        toggleContainer.appendChild(optionsContainer);
        
        // Add to header
        headerContainer.appendChild(toggleContainer);
        
        return {
            container: toggleContainer,
            buttons: {
                light: lightBtn,
                dark: darkBtn,
                blue: blueBtn
            }
        };
    }
    
    // Function to set theme
    function setTheme(theme) {
        // Remove all theme classes first
        document.body.classList.remove('dark-theme', 'blue-theme');
        
        // Set the appropriate theme
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (theme === 'blue') {
            document.body.classList.add('blue-theme');
        }
        
        // Store the selected theme
        localStorage.setItem('theme', theme);
        
        // Store when the theme was last changed (for promotional popups)
        localStorage.setItem('theme-last-changed', Date.now());
    }
    
    // Wait for the components to load
    setTimeout(function() {
        const themeToggle = createThemeToggle();
        if (!themeToggle) return;
        
        const {buttons} = themeToggle;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        // Apply theme based on preference
        setTheme(savedTheme);
        
        // Mark the active button
        const activeButton = buttons[savedTheme];
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Add click handlers to all buttons
        Object.keys(buttons).forEach(theme => {
            buttons[theme].addEventListener('click', function() {
                // Remove active class from all buttons
                Object.values(buttons).forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Apply the theme
                setTheme(theme);
                
                // Optional: Show theme changed notification
                showThemeNotification(theme);
            });
        });
    }, 500); // Wait for components to load
});

// Show notification when theme is changed
function showThemeNotification(theme) {
    // Create notification if it doesn't exist
    let notification = document.querySelector('.theme-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'theme-notification';
        document.body.appendChild(notification);
    }
    
    // Set message based on theme
    let message = '';
    switch(theme) {
        case 'light':
            message = 'Tema e çelët është aktivizuar';
            break;
        case 'dark':
            message = 'Tema e errët është aktivizuar';
            break;
        case 'blue':
            message = 'Tema blu special është aktivizuar';
            break;
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}