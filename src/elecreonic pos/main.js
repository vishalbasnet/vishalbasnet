// Enhanced POS System for Nepal - Complete Solution

// Database object
const PosDatabase = {
    inventory: [],
    sales: [],
    customers: [],
    settings: {
        shopName: "RetailPro POS",
        taxRate: 13
    },
    
    // Save all data to localStorage
    saveToLocalStorage: function() {
        try {
            const data = {
                inventory: this.inventory,
                sales: this.sales,
                customers: this.customers,
                settings: this.settings
            };
            localStorage.setItem('posData', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    },
    
    // Generate a unique ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Sales operations
    addSale: function(sale) {
        sale.id = this.generateId();
        sale.date = new Date().toISOString();
        this.sales.push(sale);
        
        // Update inventory quantities
        sale.items.forEach(item => {
            const product = this.inventory.find(p => p.id === item.productId);
            if (product) {
                product.quantity -= item.quantity;
            }
        });
        
        this.saveToLocalStorage();
        return sale;
    },
    
    getSales: function() {
        return this.sales.slice().reverse(); // Return most recent first
    },
    
    // Inventory operations
    getInventory: function() {
        return this.inventory;
    },
    
    getCategories: function() {
        const categories = new Set();
        this.inventory.forEach(item => categories.add(item.category));
        return Array.from(categories);
    },
    
    updateInventoryItem: function(updatedProduct) {
        this.inventory = this.inventory.map(p => 
            p.id === updatedProduct.id ? updatedProduct : p
        );
        this.saveToLocalStorage();
    },
    
    deleteInventoryItem: function(id) {
        this.inventory = this.inventory.filter(p => p.id !== id);
        this.saveToLocalStorage();
    },
    
    addInventoryItem: function(product) {
        product.id = this.generateId();
        product.quantity = product.quantity || 0;
        this.inventory.push(product);
        this.saveToLocalStorage();
        return product;
    },
    
    // Customer operations
    getCustomers: function() {
        return this.customers;
    },
    
    addCustomer: function(customer) {
        customer.id = this.generateId();
        this.customers.push(customer);
        this.saveToLocalStorage();
        return customer;
    },
    
    updateCustomer: function(updatedCustomer) {
        this.customers = this.customers.map(c => 
            c.id === updatedCustomer.id ? updatedCustomer : c
        );
        this.saveToLocalStorage();
    },
    
    deleteCustomer: function(id) {
        this.customers = this.customers.filter(c => c.id !== id);
        this.saveToLocalStorage();
    },
    
    // Settings operations
    updateSettings: function(settings) {
        this.settings = {...this.settings, ...settings};
        this.saveToLocalStorage();
    },
    
    // Initialization
    loadFromLocalStorage: function() {
        try {
            const data = localStorage.getItem('posData');
            if (data) {
                const parsed = JSON.parse(data);
                this.inventory = Array.isArray(parsed.inventory) ? parsed.inventory : [];
                this.sales = Array.isArray(parsed.sales) ? parsed.sales : [];
                this.customers = Array.isArray(parsed.customers) ? parsed.customers : [];
                this.settings = parsed.settings || {
                    shopName: "RetailPro POS",
                    taxRate: 13
                };
            }
            
            // Initialize with sample data ONLY if inventory is empty
            if (this.inventory.length === 0) {
                this.addInventoryItem({
                    name: "Mineral Water",
                    category: "Beverages",
                    price: 20,
                    cost: 12,
                    quantity: 50,
                    minStock: 10
                });
                
                this.addInventoryItem({
                    name: "Noodles",
                    category: "Food",
                    price: 50,
                    cost: 35,
                    quantity: 30,
                    minStock: 5
                });

                // Save initial data
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // Reset to defaults if there's an error
            this.inventory = [];
            this.sales = [];
            this.customers = [];
            this.settings = {
                shopName: "RetailPro POS",
                taxRate: 13
            };
        }
    }
};

// Initialize database
PosDatabase.loadFromLocalStorage();

// DOM Elements
const elements = {
    // Tabs and navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // POS elements
    productSearch: document.getElementById('product-search'),
    categoryTabs: document.getElementById('category-tabs'),
    productsGrid: document.getElementById('products-grid'),
    orderItems: document.getElementById('order-items'),
    subtotal: document.getElementById('subtotal'),
    tax: document.getElementById('tax'),
    total: document.getElementById('total'),
    clearOrder: document.getElementById('clear-order'),
    paymentMethods: document.querySelectorAll('.payment-method'),
    cashPaymentFields: document.getElementById('cash-payment-fields'),
    amountReceived: document.getElementById('amount-received'),
    amountReceivedDisplay: document.getElementById('amount-received-display'),
    changeDisplay: document.getElementById('change-display'),
    completeSale: document.getElementById('complete-sale'),
    
    // Inventory elements
    inventorySearch: document.getElementById('inventory-search'),
    inventoryTable: document.querySelector('#inventory-table tbody'),
    addProductBtn: document.getElementById('add-product-btn'),
    importInventoryBtn: document.getElementById('import-inventory-btn'),
    exportInventoryBtn: document.getElementById('export-inventory-btn'),
    resetInventoryBtn: document.getElementById('reset-inventory-btn'),
    
    // Sales history elements
    salesHistoryTable: document.querySelector('#sales-history-table tbody'),
    
    // Customer elements
    customersTable: document.querySelector('#customers-table tbody'),
    addCustomerForm: document.getElementById('add-customer-form'),
    
    // Analytics elements
    todaySales: document.getElementById('today-sales'),
    grossProfit: document.getElementById('gross-profit'),
    itemsSold: document.getElementById('items-sold'),
    salesChart: document.getElementById('salesChart'),
    salesChange: document.getElementById('sales-change'),
    salesTrendIcon: document.getElementById('sales-trend-icon'),
    profitChange: document.getElementById('profit-change'),
    profitTrendIcon: document.getElementById('profit-trend-icon'),
    itemsChange: document.getElementById('items-change'),
    itemsTrendIcon: document.getElementById('items-trend-icon'),

    // Modals
    modals: document.querySelectorAll('.modal'),
    addProductModal: document.getElementById('add-product-modal'),
    addProductForm: document.getElementById('add-product-form'),
    receiptModal: document.getElementById('receipt-modal'),
    receiptContent: document.getElementById('receipt-content'),
    printReceipt: document.getElementById('print-receipt'),
    settingsModal: document.getElementById('settings-modal'),
    openSettingsModal: document.getElementById('open-settings-modal'),
    shopSettingsForm: document.getElementById('shop-settings-form'),
    resetDataBtn: document.getElementById('reset-data-btn-settings'),

    // Add these to your elements object
    paymentMethodChart: document.getElementById('paymentMethodChart'),
    topProducts: document.getElementById('topProducts')
};

// Current state
const state = {
    currentTab: 'pos',
    currentOrder: {
        items: [],
        paymentMethod: null,
        amountReceived: 0
    },
    currentCategory: 'all'
};

// Utility functions
const utils = {
    formatCurrency: (amount) => {
        return `रु${amount.toFixed(2)}`;
    },
    
    calculateOrderTotals: (order) => {
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = PosDatabase.settings.taxRate / 100;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        
        return { subtotal, tax, total };
    },
    
    showError: (message) => {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => errorEl.style.display = 'none', 3000);
    },
    
    showModal: (modalId) => {
        document.getElementById(modalId).style.display = 'flex';
    },
    
    hideModal: (modalId) => {
        document.getElementById(modalId).style.display = 'none';
    },

    // Add or update this utility function for CSV handling
    exportToCsv: function(data, filename) {
        // Define CSV headers
        const headers = ['id', 'name', 'category', 'price', 'cost', 'quantity', 'minStock'];
        
        // Convert data to CSV format
        const csvContent = [
            headers.join(','),
            ...data.map(item => headers.map(header => {
                const value = item[header]?.toString().replace(/,/g, '') || '';
                return `"${value}"`;
            }).join(','))
        ].join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    parseCsv: function(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const items = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const item = {};
            
            headers.forEach((header, index) => {
                let value = values[index];
                // Convert numeric values
                if (['price', 'cost', 'quantity', 'minStock'].includes(header)) {
                    value = parseFloat(value) || 0;
                }
                item[header] = value;
            });
            items.push(item);
        }
        
        return items;
    },

    // Add these utility functions for sales history CSV export
    exportSalesHistoryToCsv: function(sales, filename) {
        const headers = ['Date', 'Invoice #', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method'];
        
        const csvRows = [
            // Add headers
            headers.join(','),
            // Add data rows
            ...sales.map(sale => {
                // Convert id to string before using slice
                const invoiceNumber = (sale.id || '').toString().slice(-6) || 'N/A';
                
                const row = [
                    new Date(sale.date).toLocaleString(),
                    invoiceNumber,
                    sale.items.reduce((sum, item) => sum + item.quantity, 0),
                    (sale.subtotal || 0).toFixed(2),
                    (sale.tax || 0).toFixed(2),
                    (sale.total || 0).toFixed(2),
                    sale.paymentMethod || 'N/A'
                ];
                // Escape any commas and wrap in quotes
                return row.map(cell => `"${cell}"`).join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // Add this to the utils object
    exportCustomersToCsv: function(customers, filename) {
        // Define headers for customer data
        const headers = ['Name', 'Email', 'Phone Number', 'Invoice ID', 'Address'];
        
        // Convert data to CSV format
        const csvRows = [
            // Add headers
            headers.join(','),
            // Add customer data rows
            ...customers.map(customer => [
                customer.name,
                customer.email || '',
                customer.phone,
                customer.invoiceId || '',
                customer.address
            ].map(field => `"${field}"`).join(','))
        ];

        const csvContent = csvRows.join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    calculateDailyComparison: (todayValue, yesterdayValue) => {
        if (yesterdayValue === 0) return { percentage: 100, trend: 'up' };
        const percentage = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
        return {
            percentage: Math.abs(percentage),
            trend: percentage >= 0 ? 'up' : 'down'
        };
    }
};

// Render functions
const render = {
    // POS rendering
    renderProducts: (products, category = 'all') => {
        elements.productsGrid.innerHTML = '';
        
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(p => p.category === category);
            
        if (filteredProducts.length === 0) {
            elements.productsGrid.innerHTML = `
                <div class="no-products">
                    No products found in this category
                </div>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.innerHTML = `
                <div class="product-image">
                    ${product.imageUrl 
                        ? `<img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='placeholder.png';this.onerror=null;">`
                        : product.name.charAt(0).toUpperCase()
                    }
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${utils.formatCurrency(product.price)}</div>
                <div class="product-stock">${product.quantity} in stock</div>
            `;
            
            productEl.addEventListener('click', () => {
                const existingItem = state.currentOrder.items.find(item => item.productId === product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    state.currentOrder.items.push({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                }
                
                render.renderOrderItems();
            });
            
            elements.productsGrid.appendChild(productEl);
        });
    },
    
    renderCategories: (categories) => {
        elements.categoryTabs.innerHTML = '';
        
        const allTab = document.createElement('div');
        allTab.className = `category-tab ${state.currentCategory === 'all' ? 'active' : ''}`;
        allTab.textContent = 'All';
        allTab.addEventListener('click', () => {
            state.currentCategory = 'all';
            render.renderCategories(categories);
            render.renderProducts(PosDatabase.getInventory(), 'all');
        });
        elements.categoryTabs.appendChild(allTab);
        
        categories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = `category-tab ${state.currentCategory === category ? 'active' : ''}`;
            tab.textContent = category;
            tab.addEventListener('click', () => {
                state.currentCategory = category;
                render.renderCategories(categories);
                render.renderProducts(PosDatabase.getInventory(), category);
            });
            elements.categoryTabs.appendChild(tab);
        });
    },
    
    renderOrderItems: () => {
        elements.orderItems.innerHTML = '';
        
        if (state.currentOrder.items.length === 0) {
            elements.orderItems.innerHTML = '<div class="empty-order">No items added yet</div>';
            elements.subtotal.textContent = utils.formatCurrency(0);
            elements.tax.textContent = utils.formatCurrency(0);
            elements.total.textContent = utils.formatCurrency(0);
            return;
        }
        
        const { subtotal, tax, total } = utils.calculateOrderTotals(state.currentOrder);
        
        state.currentOrder.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            itemEl.innerHTML = `
                <div class="order-item-info">
                    <div class="order-item-qty">${item.quantity}</div>
                    <div class="order-item-name">${item.name}</div>
                </div>
                <div class="order-item-price">${utils.formatCurrency(item.price * item.quantity)}</div>
                <div class="order-item-actions">
                    <button class="order-item-btn increase-btn" data-id="${item.productId}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="order-item-btn decrease-btn" data-id="${item.productId}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="order-item-btn remove-btn" data-id="${item.productId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            elements.orderItems.appendChild(itemEl);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const item = state.currentOrder.items.find(item => item.productId === productId);
                if (item) item.quantity += 1;
                render.renderOrderItems();
            });
        });
        
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const item = state.currentOrder.items.find(item => item.productId === productId);
                if (item) {
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        state.currentOrder.items = state.currentOrder.items.filter(i => i.productId !== productId);
                    }
                }
                render.renderOrderItems();
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                state.currentOrder.items = state.currentOrder.items.filter(i => i.productId !== productId);
                render.renderOrderItems();
            });
        });
        
        // Update totals
        elements.subtotal.textContent = utils.formatCurrency(subtotal);
        elements.tax.textContent = utils.formatCurrency(tax);
        elements.total.textContent = utils.formatCurrency(total);
    },
    
    // Inventory rendering
    renderInventory: (inventoryData = null) => {
        elements.inventoryTable.innerHTML = '';
        
        const inventory = inventoryData || PosDatabase.getInventory();
        
        if (inventory.length === 0) {
            elements.inventoryTable.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No inventory items found. Add some products to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        inventory.forEach(item => {
            // Convert ID to string and then slice, or use a fallback
            const displayId = (item.id || '').toString().slice(-6) || 'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${displayId}</td>
                <td>${item.name || ''}</td>
                <td>${item.category || ''}</td>
                <td>${utils.formatCurrency(item.price || 0)}</td>
                <td>${utils.formatCurrency(item.cost || 0)}</td>
                <td>${item.quantity || 0}</td>
                <td class="${(item.quantity <= item.minStock) ? 'stock-low' : 'stock-ok'}">
                    ${(item.quantity <= item.minStock) ? 'Low Stock' : 'In Stock'}
                </td>
                <td class="table-actions">
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            elements.inventoryTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const product = PosDatabase.getInventory().find(p => p.id === productId);
                if (product) {
                    render.showEditProductModal(productId);
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    PosDatabase.deleteInventoryItem(productId);
                    render.renderInventory();
                }
            });
        });
    },
    
    // Sales history rendering
    renderSalesHistory: () => {
        elements.salesHistoryTable.innerHTML = '';
        
        const sales = PosDatabase.getSales();
        
        if (sales.length === 0) {
            elements.salesHistoryTable.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:20px;">
                        No sales history found.
                    </td>
                </tr>
            `;
            return;
        }
        
        sales.forEach(sale => {
            const row = document.createElement('tr');
            
            // Create a formatted list of items with names and quantities
            const itemsList = sale.items.map(item => 
                `${item.name} (x${item.quantity})`
            ).join(', ');
            
            row.innerHTML = `
                <td>${new Date(sale.date).toLocaleString()}</td>
                <td>${(sale.id || '').toString().slice(-6)}</td>
                <td title="${itemsList}">${itemsList}</td>
                <td>${utils.formatCurrency(sale.subtotal)}</td>
                <td>${utils.formatCurrency(sale.tax)}</td>
                <td>${utils.formatCurrency(sale.total)}</td>
                <td>${sale.paymentMethod}</td>
            `;
            
            elements.salesHistoryTable.appendChild(row);
        });
    },

    // Add this to the render object
    renderFilteredSales: (sales) => {
        elements.salesHistoryTable.innerHTML = '';
        
        if (sales.length === 0) {
            elements.salesHistoryTable.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No matching sales found</td>
                </tr>
            `;
            return;
        }
        
        sales.forEach(sale => {
            const row = document.createElement('tr');
            
            // Create a formatted list of items with names and quantities
            const itemsList = sale.items.map(item => 
                `${item.name} (x${item.quantity})`
            ).join(', ');
            
            row.innerHTML = `
                <td>${new Date(sale.date).toLocaleString()}</td>
                <td>${(sale.id || '').toString().slice(-6)}</td>
                <td title="${itemsList}">${itemsList}</td>
                <td>${utils.formatCurrency(sale.subtotal)}</td>
                <td>${utils.formatCurrency(sale.tax)}</td>
                <td>${utils.formatCurrency(sale.total)}</td>
                <td>${sale.paymentMethod}</td>
            `;
            elements.salesHistoryTable.appendChild(row);
        });
    },
    
    // Customers rendering
    renderCustomers: () => {
        elements.customersTable.innerHTML = '';
        
        const customers = PosDatabase.getCustomers();
        
        if (customers.length === 0) {
            elements.customersTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:20px;">
                        No customers found. Add some customers to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone}</td>
                <td>${customer.invoiceId || '-'}</td>
                <td>${customer.address || '-'}</td>
                <td class="table-actions">
                    <button class="btn btn-primary btn-sm edit-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            elements.customersTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-customer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const customerId = e.currentTarget.getAttribute('data-id');
                const customer = PosDatabase.getCustomers().find(c => c.id === customerId);
                if (customer) {
                    render.showEditCustomerModal(customer);
                }
            });
        });
        
        document.querySelectorAll('.delete-customer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const customerId = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this customer?')) {
                    PosDatabase.deleteCustomer(customerId);
                    render.renderCustomers();
                }
            });
        });
    },
    
    // Enhanced analytics rendering
    renderAnalytics: () => {
        const sales = PosDatabase.getSales();
        const today = new Date().toLocaleDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();
        
        // Today's sales
        const todaySales = sales
            .filter(sale => new Date(sale.date).toLocaleDateString() === today)
            .reduce((sum, sale) => sum + sale.total, 0);
        
        // Yesterday's sales
        const yesterdaySales = sales
            .filter(sale => new Date(sale.date).toLocaleDateString() === yesterdayStr)
            .reduce((sum, sale) => sum + sale.total, 0);
        
        // Sales comparison
        const salesComparison = utils.calculateDailyComparison(todaySales, yesterdaySales);
        elements.todaySales.textContent = utils.formatCurrency(todaySales);
        elements.salesChange.textContent = `${salesComparison.percentage.toFixed(1)}% from yesterday`;
        elements.salesTrendIcon.className = salesComparison.trend === 'up' ? 
            'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        // Gross profit (simplified 30% margin)
        const todayProfit = todaySales * 0.3;
        const yesterdayProfit = yesterdaySales * 0.3;
        const profitComparison = utils.calculateDailyComparison(todayProfit, yesterdayProfit);
        elements.grossProfit.textContent = utils.formatCurrency(todayProfit);
        elements.profitChange.textContent = `${profitComparison.percentage.toFixed(1)}% from yesterday`;
        elements.profitTrendIcon.className = profitComparison.trend === 'up' ? 
            'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        // Items sold
        const todayItems = sales
            .filter(sale => new Date(sale.date).toLocaleDateString() === today)
            .reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        const yesterdayItems = sales
            .filter(sale => new Date(sale.date).toLocaleDateString() === yesterdayStr)
            .reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        const itemsComparison = utils.calculateDailyComparison(todayItems, yesterdayItems);
        elements.itemsSold.textContent = todayItems;
        elements.itemsChange.textContent = `${itemsComparison.percentage.toFixed(1)}% from yesterday`;
        elements.itemsTrendIcon.className = itemsComparison.trend === 'up' ? 
            'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        // Transactions count
        const todayTransactions = sales.filter(sale => 
            new Date(sale.date).toLocaleDateString() === today).length;
        
        const yesterdayTransactions = sales.filter(sale => 
            new Date(sale.date).toLocaleDateString() === yesterdayStr).length;
        
        const transactionsComparison = utils.calculateDailyComparison(todayTransactions, yesterdayTransactions);
        document.getElementById('transactions-count').textContent = todayTransactions;
        document.getElementById('transactions-change').textContent = 
            `${transactionsComparison.percentage.toFixed(1)}% from yesterday`;
        document.getElementById('transactions-trend-icon').className = transactionsComparison.trend === 'up' ? 
            'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        // Render all charts
        render.renderAnalyticsCharts();
    },

    // Enhanced analytics charts
    renderAnalyticsCharts: () => {
        // 1. Sales Wave Chart (Last 7 Days)
        const renderWaveChart = () => {
            const salesCtx = document.getElementById('salesWaveChart').getContext('2d');
            const gradient = salesCtx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
            gradient.addColorStop(1, 'rgba(52, 152, 219, 0.0)');

            // Get last 7 days of sales data
            const sales = PosDatabase.getSales();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const salesData = last7Days.map(date => {
                return sales
                    .filter(sale => sale.date.startsWith(date))
                    .reduce((sum, sale) => sum + sale.total, 0);
            });

            // Check if the chart exists and destroy it before creating a new one
            if (window.salesWaveChart && typeof window.salesWaveChart.destroy === 'function') {
                window.salesWaveChart.destroy();
            }

            window.salesWaveChart = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: last7Days.map(date => new Date(date).toLocaleDateString()),
                    datasets: [{
                        label: 'Daily Sales',
                        data: salesData,
                        fill: true,
                        backgroundColor: gradient,
                        borderColor: '#3498db',
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#3498db',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animations: {
                        tension: {
                            duration: 1000,
                            easing: 'linear'
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: (context) => `Sales: रु${context.raw.toFixed(2)}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                callback: value => `रु${value}`
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        };

        // 2. Payment Methods Donut Chart
        const renderDonutChart = () => {
            const paymentCtx = document.getElementById('paymentDonutChart').getContext('2d');
            const sales = PosDatabase.getSales();

            // Calculate payment method totals
            const paymentMethods = sales.reduce((acc, sale) => {
                const method = sale.paymentMethod || 'Other';
                acc[method] = (acc[method] || 0) + sale.total;
                return acc;
            }, {});

            // Check if the chart exists and destroy it before creating a new one
            if (window.paymentDonutChart && typeof window.paymentDonutChart.destroy === 'function') {
                window.paymentDonutChart.destroy();
            }

            window.paymentDonutChart = new Chart(paymentCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(paymentMethods),
                    datasets: [{
                        data: Object.values(paymentMethods),
                        backgroundColor: [
                            '#3498db',
                            '#2ecc71',
                            '#f1c40f',
                            '#e74c3c',
                            '#9b59b6'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    animations: {
                        animateRotate: true,
                        animateScale: true
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: (context) => {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: रु${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        };

        // 3. Top Products Chart
        const renderTopProductsChart = () => {
            const period = document.getElementById('top-products-period').value;
            const sales = PosDatabase.getSales();
            const now = new Date();
            
            let filteredSales = [];
            
            if (period === 'today') {
                const today = now.toLocaleDateString();
                filteredSales = sales.filter(sale => 
                    new Date(sale.date).toLocaleDateString() === today);
            } else if (period === 'week') {
                const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
                filteredSales = sales.filter(sale => 
                    new Date(sale.date) >= oneWeekAgo);
            } else if (period === 'month') {
                const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
                filteredSales = sales.filter(sale => 
                    new Date(sale.date) >= oneMonthAgo);
            }
            
            // Calculate product quantities sold
            const productSales = {};
            filteredSales.forEach(sale => {
                sale.items.forEach(item => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            name: item.name,
                            quantity: 0
                        };
                    }
                    productSales[item.productId].quantity += item.quantity;
                });
            });
            
            // Convert to array and sort
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 10);
            
            const ctx = document.getElementById('topProductsChart').getContext('2d');
            
            // Check if the chart exists and destroy it before creating a new one
            if (window.topProductsChart && typeof window.topProductsChart.destroy === 'function') {
                window.topProductsChart.destroy();
            }
            
            window.topProductsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: topProducts.map(p => p.name),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: topProducts.map(p => p.quantity),
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: context => `Sold: ${context.raw} units`
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        };

        // 4. Hourly Sales Chart
        const renderHourlySalesChart = () => {
            const ctx = document.getElementById('hourlySalesChart').getContext('2d');

            // Safely destroy the existing chart instance
            if (window.hourlySalesChart && typeof window.hourlySalesChart.destroy === 'function') {
                window.hourlySalesChart.destroy();
            }

            // Create a new chart instance
            window.hourlySalesChart = new Chart(ctx, {
                type: 'bar', // Example chart type
                data: {
                    labels: ['9 AM', '10 AM', '11 AM', '12 PM'], // Example labels
                    datasets: [{
                        label: 'Sales',
                        data: [10, 20, 30, 40], // Example data
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        };

        // Render all charts
        renderWaveChart();
        renderDonutChart();
        renderTopProductsChart();
        renderHourlySalesChart();

        // Add event listener for period change
        document.getElementById('top-products-period').addEventListener('change', renderTopProductsChart);
        
        // Add refresh button listener
        document.getElementById('refresh-sales-chart')?.addEventListener('click', () => {
            render.renderAnalytics();
        });
    },

    showEditProductModal: (productId) => {
        const editProductModal = document.getElementById('add-product-modal');
        if (!editProductModal) {
            console.error('Edit Product Modal not found!');
            return;
        }

        // Fetch the product details using the productId
        const product = PosDatabase.getInventory().find(p => p.id === productId);
        if (!product) {
            console.error('Product not found!');
            return;
        }

        // Populate modal fields with the actual product data
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-price').value = product.price || 0;
        document.getElementById('product-cost').value = product.cost || 0;
        document.getElementById('product-quantity').value = product.quantity || 0;
        document.getElementById('product-minstock').value = product.minStock || 5;
        document.getElementById('product-image-url').value = product.imageUrl || '';

        // Update the form submission logic to save changes
        const addProductForm = document.getElementById('add-product-form');
        addProductForm.onsubmit = (e) => {
            e.preventDefault();

            // Update the product with new values
            const updatedProduct = {
                ...product,
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                cost: parseFloat(document.getElementById('product-cost').value),
                quantity: parseInt(document.getElementById('product-quantity').value),
                minStock: parseInt(document.getElementById('product-minstock').value) || 5,
                imageUrl: document.getElementById('product-image-url').value || ''
            };

            // Save the updated product to the database
            PosDatabase.updateInventoryItem(updatedProduct);

            // Re-render the inventory and close the modal
            render.renderInventory();
            utils.hideModal('add-product-modal');
        };

        // Show the modal
        editProductModal.style.display = 'block';
    },

    showEditCustomerModal: (customer) => {
        const editCustomerModal = document.getElementById('edit-customer-modal');
        if (!editCustomerModal) {
            console.error('Edit Customer Modal not found!');
            return;
        }

        // Populate modal fields with customer data
        document.getElementById('edit-customer-name').value = customer.name || '';
        document.getElementById('edit-customer-email').value = customer.email || '';
        document.getElementById('edit-customer-phone').value = customer.phone || '';
        document.getElementById('edit-customer-invoice').value = customer.invoiceId || '';
        document.getElementById('edit-customer-address').value = customer.address || '';

        // Save the customer ID for updating
        editCustomerModal.setAttribute('data-customer-id', customer.id);

        // Show the modal
        editCustomerModal.style.display = 'block';
    }
};

// Add after render functions but before setupEventListeners
function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const tableBody = document.querySelector('#customers-table tbody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        let shouldShow = false;

        // Skip empty table messages
        if (cells.length <= 1) continue;

        // Search through each cell (name, email, phone, invoice, address)
        for (let i = 0; i < cells.length - 1; i++) { // -1 to skip actions column
            const cellText = cells[i].textContent.toLowerCase();
            if (cellText.includes(searchTerm)) {
                shouldShow = true;
                break;
            }
        }

        row.style.display = shouldShow ? '' : 'none';
    }
}

// Add these inside setupEventListeners()
function addCustomerSearchListeners() {
    const searchInput = document.getElementById('customer-search');
    const searchButton = document.getElementById('search-customer-btn');

    if (searchInput) {
        searchInput.addEventListener('keyup', searchCustomers);
    }

    if (searchButton) {
        searchButton.addEventListener('click', searchCustomers);
    }
}

// Add this line inside the setupEventListeners function
function setupEventListeners() {
    // Tab switching
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            state.currentTab = targetTab;
            
            // Update UI
            elements.navItems.forEach(i => i.classList.remove('active'));
            elements.tabContents.forEach(t => t.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Render appropriate content
            switch(targetTab) {
                case 'pos':
                    render.renderProducts(PosDatabase.getInventory(), state.currentCategory);
                    render.renderCategories(PosDatabase.getCategories());
                    break;
                case 'inventory':
                    render.renderInventory();
                    break;
                case 'sales-history':
                    render.renderSalesHistory();
                    break;
                case 'analytics':
                    render.renderAnalytics();
                    break;
                case 'customers':
                    render.renderCustomers();
                    break;
            }
        });
    });
    
    // POS functionality
    elements.productSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = PosDatabase.getInventory().filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
        render.renderProducts(filteredProducts, state.currentCategory);
    });
    
    elements.clearOrder.addEventListener('click', () => {
        state.currentOrder = { items: [], paymentMethod: null, amountReceived: 0 };
        render.renderOrderItems();
        elements.cashPaymentFields.style.display = 'none';
        elements.amountReceived.value = '';
        elements.paymentMethods.forEach(method => method.classList.remove('active'));
    });
    
    elements.paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            elements.paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
            
            state.currentOrder.paymentMethod = method.getAttribute('data-method');
            
            if (state.currentOrder.paymentMethod === 'cash') {
                elements.cashPaymentFields.style.display = 'block';
            } else {
                elements.cashPaymentFields.style.display = 'none';
            }
        });
    });
    
    // Add these functions to handle change calculation
    function calculateChange(totalAmount, amountReceived) {
        return Math.max(0, amountReceived - totalAmount);
    }

    // Update the amount paid and change display
    function updatePaymentDisplay(amountPaid, changeAmount) {
        const amountPaidElement = document.getElementById('amount-paid');
        const changeElement = document.getElementById('change-amount');
        
        amountPaidElement.textContent = `रु${amountPaid.toFixed(2)}`;
        changeElement.textContent = `रु${changeAmount.toFixed(2)}`;
    }

    // Add event listener for amount received input
    document.getElementById('amount-received').addEventListener('input', function(e) {
        const amountReceived = parseFloat(e.target.value) || 0;
        const totalAmount = parseFloat(document.getElementById('total').textContent.replace('रु', '')) || 0;
        
        const changeAmount = calculateChange(totalAmount, amountReceived);
        updatePaymentDisplay(amountReceived, changeAmount);
    });

    // Reset payment display when clearing order
    document.getElementById('clear-order').addEventListener('click', function() {
        updatePaymentDisplay(0, 0);
        document.getElementById('amount-received').value = '';
    });

    // Handle payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            const paymentMethod = this.dataset.method;
            const cashPaymentFields = document.getElementById('cash-payment-fields');
            
            // Show/hide cash payment fields based on payment method
            if (paymentMethod === 'cash') {
                cashPaymentFields.style.display = 'block';
            } else {
                cashPaymentFields.style.display = 'none';
                // Reset change amount for non-cash payments
                updatePaymentDisplay(0, 0);
            }
        });
    });

    document.getElementById('complete-sale').addEventListener('click', function() {
        // Check if there are items in the order
        if (state.currentOrder.items.length === 0) {
            utils.showError('Please add items to the order');
            return;
        }

        // Check if payment method is selected
        if (!state.currentOrder.paymentMethod) {
            utils.showError('Please select a payment method');
            return;
        }

        const total = parseFloat(document.getElementById('total').textContent.replace('रु', '')) || 0;
        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('रु', '')) || 0;
        const tax = parseFloat(document.getElementById('tax').textContent.replace('रु', '')) || 0;

        // For cash payments, verify amount received
        if (state.currentOrder.paymentMethod === 'cash') {
            const amountReceived = parseFloat(document.getElementById('amount-received').value) || 0;
            
            if (amountReceived < total) {
                document.getElementById('error-message').textContent = 'Insufficient amount!';
                document.getElementById('error-message').style.display = 'block';
                document.getElementById('error-message').classList.add('blink');
                document.getElementById('user-avatar').classList.add('blink');
                return;
            }

            const paymentDetails = {
                subtotal: subtotal,
                tax: tax,
                total: total,
                amountPaid: amountReceived,
                change: amountReceived - total
            };

            showReceipt(state.currentOrder.items, paymentDetails);
        } else {
            // For card or QR payments, process directly
            const paymentDetails = {
                subtotal: subtotal,
                tax: tax,
                total: total,
                amountPaid: total,
                change: 0
            };

            showReceipt(state.currentOrder.items, paymentDetails);
        }

        // Update inventory quantities
        state.currentOrder.items.forEach(item => {
            const product = PosDatabase.inventory.find(p => p.id === item.productId);
            if (product) {
                product.quantity -= item.quantity;
            }
        });

        // Save updated inventory
        PosDatabase.saveToLocalStorage();

        // Show success message
        document.getElementById('error-message').style.color = 'green';
        document.getElementById('error-message').textContent = 'Payment Complete!';
        document.getElementById('error-message').style.display = 'block';

        // Reset the order after short delay
        setTimeout(() => {
            state.currentOrder = { items: [], paymentMethod: null, amountReceived: 0 };
            render.renderOrderItems();
            document.getElementById('amount-received').value = '';
            document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));
            document.getElementById('cash-payment-fields').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
        }, 2000);
    });
    
    // Inventory functionality
    elements.addProductBtn.addEventListener('click', () => {
        elements.addProductForm.reset();
        elements.addProductForm.onsubmit = (e) => {
            e.preventDefault();
            
            const product = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                cost: parseFloat(document.getElementById('product-cost').value),
                quantity: parseInt(document.getElementById('product-quantity').value),
                minStock: parseInt(document.getElementById('product-minstock').value) || 5,
                imageUrl: document.getElementById('product-image-url').value || '' // Add this line
            };
            
            PosDatabase.addInventoryItem(product);
            render.renderInventory();
            render.renderProducts(PosDatabase.getInventory(), state.currentCategory);
            utils.hideModal('add-product-modal');
        };
        
        utils.showModal('add-product-modal');
    });
    
    elements.inventorySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const inventory = PosDatabase.getInventory();
        
        elements.inventoryTable.innerHTML = '';
        
        const filteredInventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            String(item.id).toLowerCase().includes(searchTerm)
        );
        
        if (filteredInventory.length === 0) {
            elements.inventoryTable.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No matching items found</td>
                </tr>
            `;
            return;
        }
        
        render.renderInventory(filteredInventory);
    });
    
    elements.exportInventoryBtn.addEventListener('click', () => {
        const inventory = PosDatabase.getInventory();
        const filename = `inventory_${new Date().toISOString().slice(0,10)}.csv`;
        utils.exportToCsv(inventory, filename);
    });

    elements.importInventoryBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const inventory = utils.parseCsv(event.target.result);
                    if (Array.isArray(inventory) && inventory.length > 0) {
                        if (confirm(`Import ${inventory.length} items? This will replace the current inventory.`)) {
                            // Generate new IDs for imported items
                            inventory.forEach(item => {
                                item.id = PosDatabase.generateId();
                            });
                            
                            PosDatabase.inventory = inventory;
                            PosDatabase.saveToLocalStorage();
                            render.renderInventory();
                            alert('Inventory imported successfully!');
                        }
                    } else {
                        alert('Invalid inventory file format or empty file');
                    }
                } catch (error) {
                    alert('Error reading CSV file: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });

    elements.resetInventoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the inventory? This cannot be undone.')) {
            PosDatabase.inventory = [];
            PosDatabase.saveToLocalStorage();
            render.renderInventory();
            alert('Inventory has been reset');
        }
    });
    
    // Customer functionality
    elements.addCustomerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customer = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value,
            invoiceId: document.getElementById('customer-invoice').value,
            address: document.getElementById('customer-address').value
        };
        
        PosDatabase.addCustomer(customer);
        render.renderCustomers();
        elements.addCustomerForm.reset();
    });

    document.getElementById('edit-customer-form').addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate required fields
        const name = document.getElementById('edit-customer-name').value.trim();
        const phone = document.getElementById('edit-customer-phone').value.trim();
        const email = document.getElementById('edit-customer-email').value.trim();
        let isValid = true;

        if (!name) {
            document.getElementById('name-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('name-error').style.display = 'none';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('email-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('email-error').style.display = 'none';
        }

        if (!phone) {
            document.getElementById('phone-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('phone-error').style.display = 'none';
        }

        if (!isValid) return;

        // Save changes if valid
        const customerId = document.getElementById('edit-customer-modal').getAttribute('data-customer-id');
        const updatedCustomer = {
            id: customerId,
            name: name,
            email: email,
            phone: phone,
            invoiceId: document.getElementById('edit-customer-invoice').value.trim(),
            address: document.getElementById('edit-customer-address').value.trim()
        };

        PosDatabase.updateCustomer(updatedCustomer);
        render.renderCustomers();
        utils.hideModal('edit-customer-modal');
    });

    // Cancel button functionality
    document.getElementById('cancel-edit-customer').addEventListener('click', () => {
        utils.hideModal('edit-customer-modal');
    });
    
    // Settings functionality
    elements.openSettingsModal.addEventListener('click', () => {
        document.getElementById('shop-name').value = PosDatabase.settings.shopName;
        document.getElementById('tax-rate').value = PosDatabase.settings.taxRate;
        utils.showModal('settings-modal');
    });
    
    elements.shopSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const settings = {
            shopName: document.getElementById('shop-name').value,
            taxRate: parseFloat(document.getElementById('tax-rate').value)
        };
        
        PosDatabase.updateSettings(settings);
        utils.hideModal('settings-modal');
    });
    
    // Reset data button
    elements.resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
            localStorage.removeItem('posData');
            location.reload();
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });
    
    // Print receipt button
    elements.printReceipt.addEventListener('click', () => {
        window.print();
    });

    // Add these event listeners in setupEventListeners()
    document.getElementById('sales-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const sales = PosDatabase.getSales();
        
        const filteredSales = sales.filter(sale => {
            const invoiceMatch = (sale.id || '').toString().toLowerCase().includes(searchTerm);
            const itemMatch = sale.items.some(item => 
                (item.name || '').toLowerCase().includes(searchTerm)
            );
            const paymentMatch = (sale.paymentMethod || '').toLowerCase().includes(searchTerm);
            const dateMatch = new Date(sale.date)
                .toLocaleString()
                .toLowerCase()
                .includes(searchTerm);
            
            return invoiceMatch || itemMatch || paymentMatch || dateMatch;
        });
        
        render.renderFilteredSales(filteredSales);
    });

    document.getElementById('export-sales-history').addEventListener('click', () => {
        const sales = PosDatabase.getSales();
        if (sales.length === 0) {
            alert('No sales data to export');
            return;
        }
        
        const filename = `sales_history_${new Date().toISOString().slice(0,10)}.csv`;
        try {
            utils.exportSalesHistoryToCsv(sales, filename);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting sales history. Please try again.');
        }
    });

    // Add customer export button listener
    document.getElementById('export-customers').addEventListener('click', () => {
        const customers = PosDatabase.getCustomers();
        if (customers.length === 0) {
            alert('No customer data to export');
            return;
        }
        
        const filename = `customers_${new Date().toISOString().slice(0,10)}.csv`;
        try {
            utils.exportCustomersToCsv(customers, filename);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting customers. Please try again.');
        }
    });

    addCustomerSearchListeners();

    // Add auto-refresh for analytics (every 5 minutes)
    setInterval(() => {
        if (state.currentTab === 'analytics') {
            render.renderAnalytics();
        }
    }, 300000);
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize database first
    PosDatabase.loadFromLocalStorage();
    
    // Set up all event listeners
    setupEventListeners();
    
    // Render initial inventory
    render.renderInventory();
    
    // Activate the default tab (POS)
    document.querySelector('.nav-item[data-tab="pos"]').click();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Example: Add Product Button
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            addProductModal.style.display = 'block';
        });
    }

    // Close Modal Buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Reset Inventory Button
    const resetInventoryBtn = document.getElementById('reset-inventory-btn');
    if (resetInventoryBtn) {
        resetInventoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all inventory?')) {
                // Add logic to reset inventory
                console.log('Inventory reset');
            }
        });
    }

    // Complete Sale Button
    const completeSaleBtn = document.getElementById('complete-sale');
    if (completeSaleBtn) {
        completeSaleBtn.addEventListener('click', () => {
            // Add logic to complete the sale
            console.log('Sale completed');
        });
    }

    // Add more event listeners as needed for other buttons
});

document.addEventListener('DOMContentLoaded', () => {
    const editButtons = document.querySelectorAll('.edit-product-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = button.getAttribute('data-product-id'); // Assuming the button has a data attribute for the product ID
            render.showEditProductModal(productId);
        });
    });
});

// Add after your existing complete-sale event listener

function showReceipt(items, paymentDetails) {
    const receiptModal = document.getElementById('receipt-modal');
    const receiptItems = document.querySelector('.receipt-items');
    const datetime = new Date().toLocaleString();
    const receiptNumber = 'INV-' + Date.now().toString().slice(-6);

    // Set receipt header
    document.getElementById('store-name').textContent = PosDatabase.settings.shopName;
    document.getElementById('receipt-datetime').textContent = datetime;
    document.getElementById('receipt-number').textContent = receiptNumber;

    // Clear and add items
    receiptItems.innerHTML = '';
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'receipt-item';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>रु${(item.price * item.quantity).toFixed(2)}</span>
        `;
        receiptItems.appendChild(itemDiv);
    });

    // Set totals
    document.getElementById('receipt-subtotal').textContent = `रु${paymentDetails.subtotal.toFixed(2)}`;
    document.getElementById('receipt-tax').textContent = `रु${paymentDetails.tax.toFixed(2)}`;
    document.getElementById('receipt-total').textContent = `रु${paymentDetails.total.toFixed(2)}`;
    document.getElementById('receipt-paid').textContent = `रु${paymentDetails.amountPaid.toFixed(2)}`;
    document.getElementById('receipt-change').textContent = `रु${paymentDetails.change.toFixed(2)}`;

    // Show modal
    receiptModal.style.display = 'block';

    // Save sale to database
    const sale = {
        items: items,
        subtotal: paymentDetails.subtotal,
        tax: paymentDetails.tax,
        total: paymentDetails.total,
        paymentMethod: state.currentOrder.paymentMethod,
        receiptNumber: receiptNumber,
        datetime: datetime
    };
    PosDatabase.addSale(sale);

    // Clear current order
    state.currentOrder = { items: [], paymentMethod: null, amountReceived: 0 };
    render.renderOrderItems();
}