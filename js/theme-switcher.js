/**
 * Theme Switcher - Enhanced version
 * Supports Light, Dark, Blue, and Vibrant themes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize immediately, don't wait for components
    initializeThemeSystem();
    
    // Also initialize after component loading to ensure buttons work
    document.addEventListener('component-loaded', function() {
        initializeThemeSystem();
    });
});

function initializeThemeSystem() {
    console.log("Initializing theme system...");
    
    // Create the theme toggle element if it doesn't exist
    if (!document.querySelector('.theme-toggle-container')) {
        createThemeToggle();
    }
    
    // Apply saved theme or default
    const savedTheme = localStorage.getItem('theme') || 'vibrant';
    applyTheme(savedTheme);
    
    // Attach event listeners to theme buttons
    attachThemeButtonListeners();
}

// Create the theme toggle element
function createThemeToggle() {
    console.log("Creating theme toggle...");
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return null;
    
    // Check if toggle already exists
    if (headerContainer.querySelector('.theme-toggle-container')) {
        return headerContainer.querySelector('.theme-toggle-container');
    }
    
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
    
    // Create theme buttons
    const themes = ['light', 'dark', 'blue', 'vibrant'];
    themes.forEach(theme => {
        const button = document.createElement('button');
        button.className = `theme-btn theme-btn-${theme}`;
        button.setAttribute('data-theme', theme);
        button.setAttribute('title', `Stili ${getThemeName(theme)}`);
        button.setAttribute('aria-label', `Aktivizo stilin ${getThemeName(theme)}`);
        optionsContainer.appendChild(button);
    });
    
    // Add elements to the toggle container
    toggleContainer.appendChild(label);
    toggleContainer.appendChild(optionsContainer);
    
    // Add to header
    headerContainer.appendChild(toggleContainer);
    
    return toggleContainer;
}

function getThemeName(theme) {
    switch(theme) {
        case 'light': return 'e çiltër';
        case 'dark': return 'e errët';
        case 'blue': return 'blu';
        case 'vibrant': return 'e gjallë';
        default: return theme;
    }
}

// Apply theme to the body and update active button
function applyTheme(theme) {
    console.log(`Applying theme: ${theme}`);
    
    // First remove all theme classes
    document.body.classList.remove('light-theme', 'dark-theme', 'blue-theme', 'vibrant-theme');
    
    // Add the specific theme class - make light-theme explicit
    document.body.classList.add(`${theme}-theme`);
    
    // Store the selected theme
    localStorage.setItem('theme', theme);
    
    // Update active state on buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    // Set CSS variables directly on the root element for better compatibility
    const root = document.documentElement;
    switch(theme) {
        case 'light':
            setLightThemeVars(root);
            break;
        case 'dark': 
            setDarkThemeVars(root);
            break;
        case 'blue':
            setBlueThemeVars(root);
            break;
        case 'vibrant':
            setVibrantThemeVars(root);
            break;
    }
}

// Attach event listeners to theme buttons
function attachThemeButtonListeners() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    themeButtons.forEach(button => {
        // Remove existing listeners to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new listener
        newButton.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
            showThemeNotification(theme);
        });
    });
}

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

// These functions set CSS variables directly on :root for better theme application
function setLightThemeVars(root) {
    root.style.setProperty('--primary-color', '#4a6da7');
    root.style.setProperty('--secondary-color', '#5a81c5');
    root.style.setProperty('--accent-color', '#f8b400');
    root.style.setProperty('--text-color', '#333');
    root.style.setProperty('--bg-color', '#f4f4f4');
    root.style.setProperty('--card-bg', '#fff');
    root.style.setProperty('--light-gray', '#f4f4f4');
    root.style.setProperty('--medium-gray', '#ddd');
    root.style.setProperty('--dark-gray', '#888');
    root.style.setProperty('--white', '#fff');
}

function setDarkThemeVars(root) {
    root.style.setProperty('--primary-color', '#5d84c2');
    root.style.setProperty('--secondary-color', '#7095d9');
    root.style.setProperty('--accent-color', '#ffb700');
    root.style.setProperty('--text-color', '#e0e0e0');
    root.style.setProperty('--bg-color', '#1a1a1a');
    root.style.setProperty('--card-bg', '#2d2d2d');
    root.style.setProperty('--light-gray', '#2a2a2a');
    root.style.setProperty('--medium-gray', '#3d3d3d');
    root.style.setProperty('--dark-gray', '#999');
    root.style.setProperty('--white', '#2d2d2d');
}

function setBlueThemeVars(root) {
    root.style.setProperty('--primary-color', '#1e88e5');
    root.style.setProperty('--secondary-color', '#42a5f5');
    root.style.setProperty('--accent-color', '#ff9800');
    root.style.setProperty('--text-color', '#e0e0e0');
    root.style.setProperty('--bg-color', '#0d2a4e');
    root.style.setProperty('--card-bg', '#103560');
    root.style.setProperty('--light-gray', '#164070');
    root.style.setProperty('--medium-gray', '#285e9e');
    root.style.setProperty('--dark-gray', '#9ab7d7');
    root.style.setProperty('--white', '#103560');
}

function setVibrantThemeVars(root) {
    root.style.setProperty('--primary-color', '#8e44ad');
    root.style.setProperty('--secondary-color', '#9b59b6');
    root.style.setProperty('--accent-color', '#f39c12');
    root.style.setProperty('--text-color', '#333');
    root.style.setProperty('--bg-color', '#f8f1fe');
    root.style.setProperty('--card-bg', '#fff');
    root.style.setProperty('--light-gray', '#f0e6f8');
    root.style.setProperty('--medium-gray', '#d8c6e6');
    root.style.setProperty('--dark-gray', '#7d5a9e');
    root.style.setProperty('--white', '#fff');
}