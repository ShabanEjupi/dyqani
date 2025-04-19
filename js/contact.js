/**
 * Contact Page Functionality
 * Manages contact form submission, validation, and interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ accordion
    initFaqAccordion();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize map hover effects
    initMapEffects();
    
    // Initialize Instagram feed hover effects
    initInstagramEffects();
});

// Handle FAQ accordion functionality
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Check if this item is already active
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // If the clicked item wasn't active, make it active
            if (!isActive) {
                item.classList.add('active');
            }
            
            // Add animation effect
            item.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                item.style.transition = '';
            }, 300);
        });
    });
}

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success');
    const sendAnotherBtn = document.getElementById('send-another');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simple validation
        if (!validateForm()) return;
        
        // In a real implementation, you would send the form data to a server
        // For this example, we'll just show the success message after a short delay
        submitForm();
    });
    
    // Reset form and show form again when "send another" is clicked
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', function() {
            form.reset();
            form.style.display = 'block';
            successMessage.style.display = 'none';
        });
    }
    
    // Form validation function
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const verify = document.getElementById('verify').value.trim();
        const privacyConsent = document.getElementById('privacy-consent').checked;
        
        // Check required fields
        if (!name || !email || !message) {
            showNotification('Ju lutemi plotësoni të gjitha fushat e domosdoshme.');
            return false;
        }
        
        // Check email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showNotification('Ju lutemi shkruani një adresë email të vlefshme.');
            return false;
        }
        
        // Check anti-spam question
        if (verify !== '5') {
            showNotification('Përgjigja e verifikimit është e pasaktë.');
            return false;
        }
        
        // Check privacy policy consent
        if (!privacyConsent) {
            showNotification('Ju lutemi pranoni politikën e privatësisë.');
            return false;
        }
        
        return true;
    }
    
    // Form submission function
    function submitForm() {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Duke dërguar...';
        
        // Simulate form submission delay
        setTimeout(() => {
            // Hide form and show success message
            form.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
                
                // Add animation
                successMessage.classList.add('success-animation');
            }
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    }
}

// Enhancement for map interactivity
function initMapEffects() {
    const mapInfo = document.querySelector('.map-info');
    const mapContainer = document.querySelector('.map-container');
    
    if (!mapInfo || !mapContainer) return;
    
    // Add hover effect for map info card
    mapInfo.addEventListener('mouseenter', function() {
        this.classList.add('info-card-hover');
    });
    
    mapInfo.addEventListener('mouseleave', function() {
        this.classList.remove('info-card-hover');
    });
    
    // Add interaction to directions button
    const directionsBtn = document.querySelector('.btn-directions');
    if (directionsBtn) {
        directionsBtn.addEventListener('mouseenter', function() {
            this.innerHTML = '<i class="fas fa-location-arrow"></i> Hape në Google Maps';
        });
        
        directionsBtn.addEventListener('mouseleave', function() {
            this.innerHTML = '<i class="fas fa-directions"></i> Merr udhëzimet';
        });
    }
}

// Instagram feed hover effects
function initInstagramEffects() {
    const instagramItems = document.querySelectorAll('.instagram-item');
    
    instagramItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('instagram-hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('instagram-hover');
        });
    });
}

// Show notification (reused from cart.js)
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}