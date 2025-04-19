/**
 * Admin Panel Functionality
 * Manages products, orders, and settings
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    initAdminNavigation();
    
    // Load product and order data
    loadAdminData();
    
    // Initialize product management
    initProductManagement();
    
    // Initialize dashboard charts
    initDashboardCharts();
    
    // Initialize modal handling
    initModalHandling();
});

// Initialize admin navigation
function initAdminNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get target section
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked button and target section
            this.classList.add('active');
            document.getElementById(`${targetSection}-section`).classList.add('active');
        });
    });
    
    // Handle "View All" links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            document.querySelector(`.admin-nav-item[data-section="${targetSection}"]`).click();
        });
    });
}

// Load admin data (products, orders, customers)
function loadAdminData() {
    // Load products
    loadProducts();
    
    // Load orders
    loadOrders();
    
    // Update dashboard stats
    updateDashboardStats();
}

// Load products for admin panel
function loadProducts() {
    // Get products from localStorage or global variable
    let products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    
    // Update product count
    document.getElementById('total-products').textContent = products.length;
    
    // Display products in table
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">Nuk ka produkte. Shtoni produktin e parë duke klikuar butonin "Produkt i Ri".</td>
            </tr>
        `;
        return;
    }
    
    // Add products to table
    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;
        
        // Format category
        let category = 'Tjetër';
        if (product.name.toLowerCase().includes('vajza')) category = 'Për vajza';
        else if (product.name.toLowerCase().includes('djem')) category = 'Për djem';
        else if (product.name.toLowerCase().includes('muaj') || product.name.toLowerCase().includes('foshnje')) category = 'Për foshnja';
        else if (product.name.toLowerCase().includes('set')) category = 'Sete';
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td class="product-image-cell">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/50x50?text=PA+FOTO'">
            </td>
            <td>${product.name}</td>
            <td>${category}</td>
            <td>${product.price.toFixed(2)} €</td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        productsList.appendChild(row);
    });
    
    // Add event handlers to action buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Load orders for admin panel
function loadOrders() {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Update order count
    document.getElementById('total-orders').textContent = orders.length;
    
    // Display orders in table
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">Nuk ka porosi për t'u shfaqur.</td>
            </tr>
        `;
        return;
    }
    
    // Add orders to table (most recent first)
    [...orders].reverse().forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderId = order.orderId;
        
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('sq-AL') + ' ' + orderDate.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
        
        // Determine payment method
        let paymentMethod = 'Para në dorë';
        if (order.paymentDetails) {
            paymentMethod = 'PayPal';
        }
        
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${formattedDate}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.total.toFixed(2)} €</td>
            <td><span class="payment-badge ${paymentMethod === 'PayPal' ? 'paid' : ''}">${paymentMethod}</span></td>
            <td><span class="status-badge pending">Në pritje</span></td>
            <td class="actions-cell">
                <button class="action-btn view-btn" data-id="${order.orderId}"><i class="fas fa-eye"></i></button>
                <button class="action-btn print-btn" data-id="${order.orderId}"><i class="fas fa-print"></i></button>
            </td>
        `;
        
        ordersList.appendChild(row);
    });
    
    // Display recent orders in dashboard
    const recentOrdersList = document.getElementById('recent-orders-list');
    if (recentOrdersList) {
        recentOrdersList.innerHTML = '';
        
        if (orders.length === 0) {
            recentOrdersList.innerHTML = '<p class="empty-list">Nuk ka porosi të reja.</p>';
            return;
        }
        
        // Show up to 5 most recent orders
        const recentOrders = [...orders].reverse().slice(0, 5);
        
        recentOrders.forEach(order => {
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('sq-AL');
            
            const orderItem = document.createElement('div');
            orderItem.className = 'recent-order-item';
            orderItem.innerHTML = `
                <div class="order-info">
                    <h4>Porosia #${order.orderId}</h4>
                    <p>${formattedDate}</p>
                </div>
                <div class="order-amount">${order.total.toFixed(2)} €</div>
                <div class="order-status">
                    <span class="status-badge pending">Në pritje</span>
                </div>
            `;
            
            recentOrdersList.appendChild(orderItem);
        });
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Calculate total sales
    let totalSales = 0;
    orders.forEach(order => {
        totalSales += order.total;
    });
    
    // Update stats
    document.getElementById('total-sales').textContent = `€${totalSales.toFixed(2)}`;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-products').textContent = products.length;
    
    // Get unique customers (based on email)
    const uniqueCustomers = new Set();
    orders.forEach(order => {
        if (order.customerEmail) {
            uniqueCustomers.add(order.customerEmail);
        }
    });
    document.getElementById('total-customers').textContent = uniqueCustomers.size;
}

// Initialize dashboard charts
function initDashboardCharts() {
    const ctx = document.getElementById('inventory-chart');
    if (!ctx) return;
    
    const products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    
    // Count products by category
    const categories = {
        'Për vajza': 0,
        'Për djem': 0,
        'Për foshnja': 0,
        'Sete': 0,
        'Tjetër': 0
    };
    
    products.forEach(product => {
        if (product.name.toLowerCase().includes('vajza')) categories['Për vajza']++;
        else if (product.name.toLowerCase().includes('djem')) categories['Për djem']++;
        else if (product.name.toLowerCase().includes('muaj') || product.name.toLowerCase().includes('foshnje')) categories['Për foshnja']++;
        else if (product.name.toLowerCase().includes('set')) categories['Sete']++;
        else categories['Tjetër']++;
    });
    
    // Create chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Produktet sipas kategorisë'
                }
            }
        }
    });
}

// Initialize product management
function initProductManagement() {
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openAddProductModal();
        });
    }
    
    // Initialize product search
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            filterProducts(this.value);
        });
    }
    
    // Initialize category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProductsByCategory(this.value);
        });
    }
    
    // Initialize product sort
    const sortProducts = document.getElementById('sort-products');
    if (sortProducts) {
        sortProducts.addEventListener('change', function() {
            sortProductsList(this.value);
        });
    }
}

// Filter products by search term
function filterProducts(searchTerm) {
    const rows = document.querySelectorAll('#products-list tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const productName = row.children[2].textContent.toLowerCase();
        const productId = row.children[0].textContent.toLowerCase();
        
        if (productName.includes(term) || productId.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter products by category
function filterProductsByCategory(category) {
    const rows = document.querySelectorAll('#products-list tr');
    
    if (!category) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    rows.forEach(row => {
        const productCategory = row.children[3].textContent.toLowerCase();
        
        if (productCategory.includes(category.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Sort products list
function sortProductsList(sortBy) {
    const productsList = document.getElementById('products-list');
    const rows = Array.from(productsList.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.children[2].textContent.localeCompare(b.children[2].textContent);
            case 'name-desc':
                return b.children[2].textContent.localeCompare(a.children[2].textContent);
            case 'price-asc':
                return parseFloat(a.children[4].textContent) - parseFloat(b.children[4].textContent);
            case 'price-desc':
                return parseFloat(b.children[4].textContent) - parseFloat(a.children[4].textContent);
            case 'newest':
                return b.dataset.productId.localeCompare(a.dataset.productId);
            default:
                return 0;
        }
    });
    
    // Clear and append sorted rows
    productsList.innerHTML = '';
    rows.forEach(row => productsList.appendChild(row));
}

// Initialize modal handling
function initModalHandling() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-product');
    const productForm = document.getElementById('product-form');
    
    if (!modal || !closeBtn || !cancelBtn || !productForm) return;
    
    // Close modal on X button click
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal on cancel button click
    cancelBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle product form submission
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // Handle file upload
    const fileInput = document.getElementById('product-image-file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('image-preview');
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    document.getElementById('product-image-url').value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle image URL input
    const imageUrlInput = document.getElementById('product-image-url');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                const imagePreview = document.getElementById('image-preview');
                imagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.src='https://via.placeholder.com/100x100?text=PA+FOTO'">`;
            }
        });
    }
}

// Open modal for adding a new product
function openAddProductModal() {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    
    if (!modal || !modalTitle || !productForm) return;
    
    // Set modal title
    modalTitle.textContent = 'Produkt i Ri';
    
    // Reset form
    productForm.reset();
    
    // Reset image preview
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = `
            <i class="fas fa-image"></i>
            <span>Asnjë imazh i zgjedhur</span>
        `;
    }
    
    // Generate new product ID
    document.getElementById('product-id').value = 'PROD' + Date.now().toString().slice(-6);
    
    // Show modal
    modal.style.display = 'block';
}

// Open modal for editing an existing product
function editProduct(productId) {
    const products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        alert('Produkti nuk u gjet!');
        return;
    }
    
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !modalTitle) return;
    
    // Set modal title
    modalTitle.textContent = 'Modifiko Produktin';
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-image-url').value = product.image || '';
    document.getElementById('product-instagram').value = product.instagramLink || '';
    
    // Determine category
    let category = '';
    if (product.name.toLowerCase().includes('vajza')) category = 'girls';
    else if (product.name.toLowerCase().includes('djem')) category = 'boys';
    else if (product.name.toLowerCase().includes('muaj') || product.name.toLowerCase().includes('foshnje')) category = 'babies';
    else if (product.name.toLowerCase().includes('set')) category = 'sets';
    
    document.getElementById('product-category').value = category;
    
    // Update image preview
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview && product.image) {
        imagePreview.innerHTML = `<img src="${product.image}" alt="Preview" onerror="this.src='https://via.placeholder.com/100x100?text=PA+FOTO'">`;
    }
    
    // Show modal
    modal.style.display = 'block';
}

// Close product modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}

// Save product (add new or update existing)
function saveProduct() {
    // Get form values
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const id = document.getElementById('product-id').value.trim() || 'PROD' + Date.now().toString().slice(-6);
    const description = document.getElementById('product-description').value.trim();
    const imageUrl = document.getElementById('product-image-url').value.trim();
    const instagramLink = document.getElementById('product-instagram').value.trim();
    
    // Validate required fields
    if (!name || isNaN(price) || price <= 0) {
        alert('Ju lutemi plotësoni të gjitha fushat e detyrueshme!');
        return;
    }
    
    // Get products from localStorage or global variable
    let products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    
    // Check if product already exists
    const existingProductIndex = products.findIndex(p => p.id === id);
    
    // Create product object
    const product = {
        id: id,
        name: name,
        price: price,
        description: description,
        image: imageUrl || 'https://via.placeholder.com/300x300?text=PA+FOTO',
        instagramLink: instagramLink
    };
    
    if (existingProductIndex >= 0) {
        // Update existing product
        products[existingProductIndex] = product;
    } else {
        // Add new product
        products.push(product);
    }
    
    // Save products back to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update global products variable if exists
    if (window.products) {
        window.products = products;
    }
    
    // Close modal
    closeModal();
    
    // Reload products list
    loadProducts();
    
    // Update dashboard
    updateDashboardStats();
    initDashboardCharts();
    
    // Show success message
    showAdminNotification(existingProductIndex >= 0 ? 'Produkti u përditësua me sukses!' : 'Produkti u shtua me sukses!');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('A jeni të sigurt që dëshironi të fshini këtë produkt?')) {
        return;
    }
    
    // Get products from localStorage or global variable
    let products = window.products || JSON.parse(localStorage.getItem('products')) || [];
    
    // Filter out the product to delete
    products = products.filter(p => p.id !== productId);
    
    // Save products back to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update global products variable if exists
    if (window.products) {
        window.products = products;
    }
    
    // Reload products list
    loadProducts();
    
    // Update dashboard
    updateDashboardStats();
    initDashboardCharts();
    
    // Show success message
    showAdminNotification('Produkti u fshi me sukses!');
}

// Show admin notification
function showAdminNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.admin-notification');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'admin-notification';
        document.body.appendChild(notificationContainer);
    }
    
    // Set message
    notificationContainer.textContent = message;
    
    // Show notification
    notificationContainer.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notificationContainer.classList.remove('show');
    }, 3000);
}