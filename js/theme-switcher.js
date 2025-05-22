/**
 * Theme Switcher - Enhanced version
 * Supports Light, Dark, Blue, and Vibrant themes
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
        label.textContent = 'Stili:';
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'theme-options';
        
        // Create light theme button
        const lightBtn = document.createElement('div');
        lightBtn.className = 'theme-btn theme-btn-light';
        lightBtn.setAttribute('data-theme', 'light');
        lightBtn.setAttribute('title', 'Stili i çiltër');
        lightBtn.setAttribute('aria-label', 'Aktivizo stilin e çiltër');
        
        // Create dark theme button
        const darkBtn = document.createElement('div');
        darkBtn.className = 'theme-btn theme-btn-dark';
        darkBtn.setAttribute('data-theme', 'dark');
        darkBtn.setAttribute('title', 'Stili i errët');
        darkBtn.setAttribute('aria-label', 'Aktivizo stilin e errët');
        
        // Create blue theme button
        const blueBtn = document.createElement('div');
        blueBtn.className = 'theme-btn theme-btn-blue';
        blueBtn.setAttribute('data-theme', 'blue');
        blueBtn.setAttribute('title', 'Stili blu');
        blueBtn.setAttribute('aria-label', 'Aktivizo stilin blu');
        
        // Create vibrant theme button
        const vibrantBtn = document.createElement('div');
        vibrantBtn.className = 'theme-btn theme-btn-vibrant';
        vibrantBtn.setAttribute('data-theme', 'vibrant');
        vibrantBtn.setAttribute('title', 'Stili i gjallë');
        vibrantBtn.setAttribute('aria-label', 'Aktivizo stilin e gjallë');
        
        // Add them to the options container
        optionsContainer.appendChild(lightBtn);
        optionsContainer.appendChild(darkBtn);
        optionsContainer.appendChild(blueBtn);
        optionsContainer.appendChild(vibrantBtn);
        
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
                blue: blueBtn,
                vibrant: vibrantBtn
            }
        };
    }
    
    // Function to set theme
    function setTheme(theme) {
        // Remove all theme classes first
        document.body.classList.remove('dark-theme', 'blue-theme', 'vibrant-theme');
        
        // Set the appropriate theme
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else if (theme === 'blue') {
            document.body.classList.add('blue-theme');
        } else if (theme === 'vibrant') {
            document.body.classList.add('vibrant-theme');
        }
        
        // Store the selected theme
        localStorage.setItem('theme', theme);
        
        // Store when the theme was last changed (for promotional popups)
        localStorage.setItem('theme-last-changed', Date.now());
        
        // Update active state on buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.theme-btn-${theme}`).classList.add('active');
    }
    
    // Wait for the components to load
    setTimeout(function() {
        const themeToggle = createThemeToggle();
        if (!themeToggle) return;
        
        const {buttons} = themeToggle;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'vibrant'; // Set vibrant as default
        
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
    let themeName = 'çelët';
    if (theme === 'dark') themeName = 'errët';
    if (theme === 'blue') themeName = 'blu';
    if (theme === 'vibrant') themeName = 'i gjallë';
    
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.theme-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification theme-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = `Stili u ndryshua në ${themeName}`;
    notification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}