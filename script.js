/* ===========================
   GLOBAL CONFIG & CONSTANTS
   =========================== */
const API_BASE_URL = 'https://daboysmenu.vercel.app/api'; // Change to deployed backend URL later (e.g., https://yourvercelapp.com/api)
const STORAGE_KEY = 'daboy_menu_products'; // localStorage key for offline mode (fallback)
const ORDERS_STORAGE_KEY = 'daboy_customer_orders'; // localStorage key for customer orders
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB max image size
let USE_API = true; // Set to false to use localStorage instead
let currentProduct = null; // Store current product for modal

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Fetch products from API or localStorage
 */
async function getProducts() {
    if (!USE_API) {
        return getProductsFromStorage();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.warn('⚠️ Falling back to localStorage...');
        USE_API = false;
        return getProductsFromStorage();
    }
}

/**
 * Get products from localStorage (fallback)
 */
function getProductsFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save products to localStorage (fallback)
 */
function saveProductsToStorage(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/**
 * Generate unique ID
 */
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Show message (success or error)
 */
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('formMessage');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 4000);
    }
}

/**
 * Format price as currency
 */
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

// ===========================
// CUSTOMER MENU FUNCTIONS
// ===========================

/**
 * Load and display customer menu
 */
async function loadCustomerMenu() {
    const products = await getProducts();
    displayProducts(products);
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsMsg = document.getElementById('noProducts');

    if (!products || products.length === 0) {
        container.innerHTML = '';
        noProductsMsg.style.display = 'block';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="openModal('${product._id || product.id}')">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : '<div class="product-image placeholder">📦</div>'}
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <span class="product-quantity ${product.quantity <= 0 ? 'out-of-stock' : ''}">
                        ${product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    noProductsMsg.style.display = 'none';
}

/**
 * Setup category filter buttons
 */
async function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = await getProducts();

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            const category = this.getAttribute('data-category');
            const filtered = category === 'all' 
                ? products 
                : products.filter(p => p.category === category);

            displayProducts(filtered);
        });
    });
}

// ===========================
// ADMIN PANEL FUNCTIONS
// ===========================

/**
 * Load and display admin products list
 */
async function loadAdminProducts() {
    const products = await getProducts();
    displayAdminProducts(products);
}

/**
 * Display products in admin list
 */
function displayAdminProducts(products) {
    const container = document.getElementById('adminProductsList');

    if (!products || products.length === 0) {
        container.innerHTML = '<div class="loading">No products yet. Add your first product!</div>';
        return;
    }

    container.innerHTML = products.map(product => {
        const productId = product._id || product.id; // MongoDB uses _id, localStorage uses id
        return `
        <div class="admin-product-item">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="admin-product-image">` : '<div class="admin-product-image" style="background: #e0e0e0; display: flex; align-items: center; justify-content: center;">📦</div>'}
            <div class="admin-product-info">
                <div class="admin-product-name">${product.name}</div>
                <div class="admin-product-meta">
                    <span><strong>Category:</strong> ${product.category}</span>
                    <span><strong>Price:</strong> ${formatPrice(product.price)}</span>
                    <span><strong>Stock:</strong> ${product.quantity}</span>
                </div>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-edit" onclick="editProduct('${productId}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct('${productId}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

/**
 * Setup admin form
 */
function setupAdminForm() {
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitProduct();
    });

    // Handle image preview
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                showMessage('Image size too large (max 2MB)', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                // Store the base64 image in a data attribute
                imageInput.dataset.base64 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle search
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const products = getProductsFromStorage();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
            displayAdminProducts(filtered);
        });
    }
}

/**
 * Submit product (add or edit) to API or localStorage
 */
async function submitProduct() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const description = document.getElementById('productDescription').value.trim();
    const imageInput = document.getElementById('productImage');
    const imageBase64 = imageInput.dataset.base64 || '';

    // Validation
    if (!name || !category || !price || quantity < 0) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    const productData = {
        name,
        category,
        price,
        quantity,
        description,
        image: imageBase64 || null
    };

    try {
        if (productId) {
            // Edit existing product
            if (USE_API) {
                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) throw new Error('Failed to update product');
            } else {
                // Fallback to localStorage
                const products = getProductsFromStorage();
                const index = products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    products[index] = { ...products[index], ...productData };
                    saveProductsToStorage(products);
                }
            }
            showMessage('Product updated successfully!', 'success');
        } else {
            // Add new product
            if (USE_API) {
                const response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) throw new Error('Failed to create product');
            } else {
                // Fallback to localStorage
                const products = getProductsFromStorage();
                products.push({
                    id: generateId(),
                    ...productData,
                    createdAt: new Date().toISOString()
                });
                saveProductsToStorage(products);
            }
            showMessage('Product added successfully!', 'success');
        }

        resetForm();
        await loadAdminProducts();

        // Reload customer menu if it's open
        if (document.getElementById('productsContainer')) {
            await loadCustomerMenu();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message, 'error');
    }
}

/**
 * Edit product - load product data into form
 */
async function editProduct(productId) {
    const products = await getProducts();
    const product = products.find(p => p._id === productId || p.id === productId);

    if (product) {
        document.getElementById('productId').value = product._id || product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productDescription').value = product.description || '';

        // Show image preview if exists
        const imagePreview = document.getElementById('imagePreview');
        if (product.image) {
            imagePreview.innerHTML = `<img src="${product.image}" alt="Preview">`;
            document.getElementById('productImage').dataset.base64 = product.image;
        }

        // Change button text
        document.getElementById('submitBtn').textContent = 'Update Product';

        // Scroll to form
        document.querySelector('.admin-form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Delete product from API or localStorage
 */
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            if (USE_API) {
                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete product');
            } else {
                // Fallback to localStorage
                const products = getProductsFromStorage();
                const filtered = products.filter(p => p.id !== productId);
                saveProductsToStorage(filtered);
            }
            showMessage('Product deleted successfully!', 'success');
            await loadAdminProducts();

            // Reload customer menu if it's open
            if (document.getElementById('productsContainer')) {
                await loadCustomerMenu();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error: ' + error.message, 'error');
        }
    }
}

// ===========================
// MODAL & ORDER FUNCTIONS
// ===========================

/**
 * Open purchase modal
 */
async function openModal(productId) {
    const products = await getProducts();
    const product = products.find(p => p._id === productId || p.id === productId);

    if (!product || product.quantity <= 0) {
        alert('This product is out of stock');
        return;
    }

    currentProduct = product;
    document.getElementById('productModalName').value = product.name;
    document.getElementById('pricePerUnit').value = formatPrice(product.price);
    document.getElementById('quantityInput').value = 1;
    document.getElementById('quantityInput').max = product.quantity;
    document.getElementById('stockInfo').textContent = `Available: ${product.quantity} units`;
    updateTotal();

    document.getElementById('purchaseModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('purchaseModal').style.display = 'none';
    document.getElementById('customerName').value = '';
    document.getElementById('quantityInput').value = 1;
    document.body.style.overflow = 'auto';
    currentProduct = null;
}

/**
 * Increment quantity
 */
function incrementQty() {
    const input = document.getElementById('quantityInput');
    const max = parseInt(input.max);
    const current = parseInt(input.value);
    if (current < max) {
        input.value = current + 1;
        updateTotal();
    }
}

/**
 * Decrement quantity
 */
function decrementQty() {
    const input = document.getElementById('quantityInput');
    const current = parseInt(input.value);
    if (current > 1) {
        input.value = current - 1;
        updateTotal();
    }
}

/**
 * Update total price
 */
function updateTotal() {
    const quantity = parseInt(document.getElementById('quantityInput').value);
    const price = currentProduct.price;
    const total = quantity * price;
    document.getElementById('totalPrice').value = formatPrice(total);
}

/**
 * Submit purchase order
 */
async function submitPurchase(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const quantity = parseInt(document.getElementById('quantityInput').value);

    if (!customerName) {
        alert('Please enter your name');
        return;
    }

    if (quantity > currentProduct.quantity) {
        alert('Requested quantity exceeds available stock');
        return;
    }

    // Create order object
    const order = {
        id: generateId(),
        productId: currentProduct._id || currentProduct.id,
        productName: currentProduct.name,
        category: currentProduct.category,
        customerName: customerName,
        quantity: quantity,
        pricePerUnit: currentProduct.price,
        totalPrice: quantity * currentProduct.price,
        orderDate: new Date().toISOString(),
        status: 'pending'
    };

    // Save order to localStorage
    saveOrder(order);

    // Update product quantity
    await updateProductQuantity(currentProduct._id || currentProduct.id, quantity);

    alert('Order placed successfully! Thank you for your purchase.');
    closeModal();

    // Reload products to reflect updated quantities
    await loadCustomerMenu();
}

/**
 * Save order to localStorage
 */
function saveOrder(order) {
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY)
        ? JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY))
        : [];
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Get all orders from localStorage
 */
function getOrders() {
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

/**
 * Update product quantity after purchase
 */
async function updateProductQuantity(productId, quantityBought) {
    if (USE_API) {
        // Update via API
        try {
            const products = await getProducts();
            const product = products.find(p => p._id === productId);
            if (product) {
                const newQuantity = product.quantity - quantityBought;
                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        quantity: newQuantity,
                        description: product.description,
                        image: product.image
                    })
                });
                if (!response.ok) {
                    console.error('Failed to update product quantity via API');
                    // Fallback to localStorage
                    updateProductQuantityLocal(productId, quantityBought);
                }
            }
        } catch (error) {
            console.error('API Error updating quantity:', error);
            // Fallback to localStorage
            updateProductQuantityLocal(productId, quantityBought);
        }
    } else {
        // Update localStorage
        updateProductQuantityLocal(productId, quantityBought);
    }
}

/**
 * Update product quantity in localStorage (helper function)
 */
function updateProductQuantityLocal(productId, quantityBought) {
    const products = getProductsFromStorage();
    const productIndex = products.findIndex(p => p._id === productId || p.id === productId);
    if (productIndex !== -1) {
        products[productIndex].quantity -= quantityBought;
        saveProductsToStorage(products);
    }
}

/**
 * Display customer orders in admin panel
 */
function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');

    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="loading">No customer orders yet.</div>';
        return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    container.innerHTML = orders.map(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();

        return `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-customer">
                        <strong>👤 ${order.customerName}</strong>
                        <span class="order-date">${formattedDate}</span>
                    </div>
                    <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-details">
                    <div class="order-product">
                        <span><strong>Product:</strong> ${order.productName}</span>
                        <span><strong>Category:</strong> ${order.category}</span>
                    </div>
                    <div class="order-info">
                        <span><strong>Quantity:</strong> ${order.quantity}</span>
                        <span><strong>Price per Unit:</strong> ${formatPrice(order.pricePerUnit)}</span>
                        <span class="order-total"><strong>Total:</strong> ${formatPrice(order.totalPrice)}</span>
                    </div>
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `<button class="btn btn-success" onclick="completeOrder('${order.id}')">✓ Complete</button>` : '<span style="color: green; font-weight: bold;">✓ Completed</span>'}
                    <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Mark order as complete
 */
function completeOrder(orderId) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        showMessage('Order marked as complete!', 'success');
        loadAdminOrders();
    } else {
        showMessage('Order not found', 'error');
    }
}

/**
 * Delete order
 */
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        const orders = getOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));
        showMessage('Order deleted successfully!', 'success');
        loadAdminOrders();
    }
}

/**
 * Load and display orders in admin panel
 */
function loadAdminOrders() {
    const orders = getOrders();
    displayOrders(orders);

    // Setup search
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const filtered = orders.filter(o =>
                o.customerName.toLowerCase().includes(query) ||
                o.productName.toLowerCase().includes(query)
            );
            displayOrders(filtered);
        });
    }
}

/**
 * Switch between admin tabs
 */
function switchTab(tabName) {
    const productsTab = document.getElementById('productsTab');
    const ordersTab = document.getElementById('ordersTab');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Hide all tabs
    productsTab.style.display = 'none';
    ordersTab.style.display = 'none';

    // Remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    if (tabName === 'products') {
        productsTab.style.display = 'grid';
        tabButtons[0].classList.add('active');
    } else if (tabName === 'orders') {
        ordersTab.style.display = 'grid';
        tabButtons[1].classList.add('active');
        loadAdminOrders();
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('purchaseModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// ===========================
// SAMPLE DATA (FOR TESTING)
// ===========================

/**
 * Load sample products (for testing/demo)
 */
function loadSampleProducts() {
    const sampleProducts = [
        {
            id: generateId(),
            name: 'Iced Coffee',
            category: 'beverages',
            price: 3.50,
            quantity: 15,
            description: 'Cold brew coffee with ice',
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Mango Smoothie',
            category: 'beverages',
            price: 4.00,
            quantity: 10,
            description: 'Fresh mango blended smoothie',
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Chocolate Cake',
            category: 'desserts',
            price: 2.50,
            quantity: 8,
            description: 'Rich chocolate cake slice',
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Crispy Fries',
            category: 'snacks',
            price: 2.00,
            quantity: 20,
            description: 'Golden crispy french fries',
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Grilled Chicken Meal',
            category: 'meals',
            price: 8.50,
            quantity: 5,
            description: 'Grilled chicken with rice and vegetables',
            image: null,
            createdAt: new Date().toISOString()
        }
    ];

    if (localStorage.getItem(STORAGE_KEY) === null) {
        saveProductsToStorage(sampleProducts);
    }
}

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize on page load (auto-run by DOM DOMContentLoaded event)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load sample products on first load (optional, comment out if you don't want this)
    loadSampleProducts();
});
