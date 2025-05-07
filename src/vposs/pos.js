// // pos.js (Full Fixed Version)

// Global variables
let dailySales = JSON.parse(localStorage.getItem('dailySales')) || [];
let currentTransaction = JSON.parse(localStorage.getItem('currentTransaction')) || [];
let salesChart = null;
let trendChart = null;
let productsChart = null;
let inventoryModule = null;

// Load inventory module
async function loadInventoryModule() {
    try {
        inventoryModule = await import('./posinventory.js');
    } catch (error) {
        console.error("Error loading inventory module:", error);
        inventoryModule = {
            updateInventory: function(product, quantity) {
                console.log(`[Fallback] ${quantity} units of ${product} removed from inventory.`);
            }
        };
    }
}

// Section toggles
window.showDashboard = function() {
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('pricing-list').classList.add('hidden');
    document.getElementById('pos-section').classList.add('hidden');
};

window.showPricing = function() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('pricing-list').classList.remove('hidden');
    document.getElementById('pos-section').classList.add('hidden');
};

window.showSection = function(sectionId) {
    ['dashboard', 'pricing-list', 'pos-section'].forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.toggle('hidden', id !== sectionId);
        }
    });
};

// Complete this function
function updateTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    const productTotals = {};
    dailySales.forEach(sale => {
        if (!productTotals[sale.productName]) {
            productTotals[sale.productName] = 0;
        }
        productTotals[sale.productName] += sale.total;
    });

    const sorted = Object.entries(productTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map(p => p[0]);
    const values = sorted.map(p => p[1]);

    if (productsChart) productsChart.destroy();

    productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Top Products (रु)',
                data: values,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Your existing full code continues from here (already included in the original upload)
// The rest of pos.js remains unchanged and already includes POS logic, event handlers, and rendering.


// Initialize the POS system
document.addEventListener('DOMContentLoaded', () => {
    loadInventoryModule();
    initializePOS();
    updateDashboard();
    updatePricingList();
    showSection('pos-section');
    
    // Set up theme toggle
    setupThemeToggle();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up auto-save
    setupAutoSave();
});

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + N: New transaction
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            cancelTransaction();
        }
        
        // Alt + P: Complete payment (cash)
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            completePayment('cash');
        }
        
        // Alt + I: Jump to product ID field
        if (e.altKey && e.key === 'i') {
            e.preventDefault();
            document.getElementById('product-id').focus();
        }
    });
}

// Setup auto-save
function setupAutoSave() {
    // Save current transaction every 30 seconds
    setInterval(() => {
        if (currentTransaction.length > 0) {
            localStorage.setItem('currentTransaction', JSON.stringify(currentTransaction));
            showAutoSaveNotification();
        }
    }, 30000);
}

// Show auto-save notification
function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';
    notification.innerHTML = '<i class="fas fa-save"></i> Auto-saved';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }, 100);
}

// Initialize POS event listeners
function initializePOS() {
    // Product ID autofill
    document.getElementById('product-id')?.addEventListener('input', function() {
        const productId = this.value;
        let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
        const product = inventory.find(p => p.serial === productId);

        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('unit-type').value = product.unitType || 'packet';
            
            // Auto focus on quantity after successful lookup
            document.getElementById('quantity').focus();
        }
    });
    
    // Product search autofill
    document.getElementById('product-name')?.addEventListener('input', function() {
        const productName = this.value.toLowerCase();
        let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
        
        // Create autocomplete dropdown
        showProductAutocomplete(productName, inventory);
    });

    // POS form submission
    document.getElementById('pos-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addItemToTransaction();
    });

    // Received amount calculation
    document.getElementById('received-amount')?.addEventListener('input', function() {
        calculateChange();
    });
    
    // Price search functionality
    document.getElementById('price-search')?.addEventListener('input', function() {
        filterPriceList(this.value);
    });
    
    // History filter
    document.getElementById('history-filter')?.addEventListener('change', function() {
        filterHistory();
    });

    // Load initial data
    updateSalesTable();
    updateHistoryTable();
    updateCurrentTransactionTotal();
    updateSalesCharts();
}

// Show product autocomplete
function showProductAutocomplete(searchTerm, inventory) {
    const productNameInput = document.getElementById('product-name');
    const existingDropdown = document.getElementById('product-autocomplete');
    
    // Remove existing dropdown if exists
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    if (searchTerm.length < 2) return;
    
    // Filter inventory based on search term
    const matchingProducts = inventory.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Limit to 5 results
    
    if (matchingProducts.length === 0) return;
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'product-autocomplete';
    dropdown.className = 'autocomplete-dropdown';
    
    matchingProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = product.name;
        
        item.addEventListener('click', () => {
            document.getElementById('product-id').value = product.serial;
            document.getElementById('product-name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('unit-type').value = product.unitType || 'packet';
            document.getElementById('quantity').focus();
            dropdown.remove();
        });
        
        dropdown.appendChild(item);
    });
    
    // Position and append dropdown
    const rect = productNameInput.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.width = `${rect.width}px`;
    
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (e.target !== productNameInput && e.target !== dropdown) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Filter price list
function filterPriceList(searchTerm) {
    const priceTable = document.getElementById('price-table');
    const rows = priceTable.querySelectorAll('tbody tr');
    
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const productName = row.cells[1].textContent.toLowerCase();
        const serialNumber = row.cells[0].textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || serialNumber.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Add item to current transaction
function addItemToTransaction() {
    const productId = document.getElementById('product-id').value;
    const productName = document.getElementById('product-name').value;
    const unitType = document.getElementById('unit-type').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    if (!productId || !productName || !quantity || !price) {
        showError("Please fill all required fields", document.getElementById("error-message"));
        return;
    }
    
    const total = quantity * price * (1 - discount / 100);

    // Check if product already exists in current transaction
    const existingItemIndex = currentTransaction.findIndex(item => 
        item.productId === productId
    );
    
    if (existingItemIndex !== -1) {
        // Update existing item
        currentTransaction[existingItemIndex].quantity += quantity;
        currentTransaction[existingItemIndex].total += total;
    } else {
        // Add new item
        const sale = {
            productId: productId,
            productName: productName,
            unitType: unitType,
            quantity: quantity,
            price: price,
            discount: discount,
            total: total,
            time: new Date().toLocaleString(),
            date: new Date().toISOString().split('T')[0],
            paymentMethod: document.getElementById('payment-type').value
        };
        
        currentTransaction.push(sale);
    }

    updateSalesTable();
    updateCurrentTransactionTotal();
    
    // Reset form but keep focus on product ID for quick entry
    document.getElementById('pos-form').reset();
    document.getElementById('product-id').focus();
    
    // Show brief success message
    const successIcon = document.createElement('div');
    successIcon.className = 'item-added-icon';
    successIcon.innerHTML = '✓';
    document.body.appendChild(successIcon);
    
    setTimeout(() => {
        successIcon.classList.add('fadeout');
        setTimeout(() => {
            document.body.removeChild(successIcon);
        }, 500);
    }, 500);
}

// Update sales table
function updateSalesTable() {
    const tbody = document.getElementById('sales-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let subtotal = 0;
    let totalDiscount = 0;

    currentTransaction.forEach((sale, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${sale.productName}</td>
            <td>${sale.quantity} ${sale.unitType}</td>
            <td>रु${sale.price.toFixed(2)}</td>
            <td>${sale.discount}%</td>
            <td>रु${sale.total.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editItem(${index})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteItem(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        subtotal += sale.quantity * sale.price;
        totalDiscount += sale.quantity * sale.price * (sale.discount / 100);
    });

    document.getElementById('subtotal').textContent = `रु${subtotal.toFixed(2)}`;
    document.getElementById('total-discount').textContent = `रु${totalDiscount.toFixed(2)}`;
    document.getElementById('current-total').textContent = `रु${(subtotal - totalDiscount).toFixed(2)}`;

    localStorage.setItem('currentTransaction', JSON.stringify(currentTransaction));
}

// Edit item in transaction
window.editItem = function(index) {
    const item = currentTransaction[index];
    
    // Create modal for editing
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>Edit Item</h3>
            <div class="form-group">
                <label for="edit-quantity">Quantity</label>
                <input type="number" id="edit-quantity" value="${item.quantity}" step="0.01">
            </div>
            <div class="form-group">
                <label for="edit-price">Price</label>
                <input type="number" id="edit-price" value="${item.price}" step="0.01">
            </div>
            <div class="form-group">
                <label for="edit-discount">Discount (%)</label>
                <input type="number" id="edit-discount" value="${item.discount}" min="0" max="100">
            </div>
            <div class="button-row">
                <button class="cancel-btn" id="edit-cancel">Cancel</button>
                <button class="save-btn" id="edit-save">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('edit-save').addEventListener('click', () => {
        const newQuantity = parseFloat(document.getElementById('edit-quantity').value);
        const newPrice = parseFloat(document.getElementById('edit-price').value);
        const newDiscount = parseFloat(document.getElementById('edit-discount').value);
        
        if (newQuantity <= 0) {
            alert("Quantity must be greater than zero");
            return;
        }
        
        currentTransaction[index].quantity = newQuantity;
        currentTransaction[index].price = newPrice;
        currentTransaction[index].discount = newDiscount;
        currentTransaction[index].total = newQuantity * newPrice * (1 - newDiscount / 100);
        
        updateSalesTable();
        updateCurrentTransactionTotal();
        
        document.body.removeChild(modal);
    });
    
    document.getElementById('edit-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
};

// Update history table
function updateHistoryTable(filter = 'all', date = '') {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    let filteredSales = dailySales;
    if (filter === 'today') {
        filteredSales = dailySales.filter(sale => sale.date === today);
    } else if (filter === 'cash' || filter === 'credit' || filter === 'digital') {
        filteredSales = dailySales.filter(sale => sale.paymentMethod === filter);
    }
    
    if (date) {
        filteredSales = filteredSales.filter(sale => sale.date === date);
    }

    // Sort by date (newest first)
    filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredSales.forEach((sale, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDate(sale.date)}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity} ${sale.unitType}</td>
            <td>रु${sale.price.toFixed(2)}</td>
            <td>${sale.discount}%</td>
            <td>रु${sale.total.toFixed(2)}</td>
            <td>
                <span class="payment-badge ${sale.paymentMethod}">
                    ${sale.paymentMethod}
                </span>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteHistoryItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
    
    // Show no data message if empty
    if (filteredSales.length === 0) {
        const emptyRow = tbody.insertRow();
        emptyRow.innerHTML = `
            <td colspan="8" class="no-data">No sales records found for the selected filter</td>
        `;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Filter history by date
window.filterHistoryByDate = function() {
    const date = document.getElementById('history-date').value;
    const filter = document.getElementById('history-filter').value;
    updateHistoryTable(filter, date);
};

// Filter history
window.filterHistory = function() {
    const filter = document.getElementById('history-filter').value;
    const date = document.getElementById('history-date').value;
    updateHistoryTable(filter, date);
};

// Update current transaction total
function updateCurrentTransactionTotal() {
    const total = currentTransaction.reduce((sum, sale) => sum + sale.total, 0);
    calculateChange();
    
    // Enable/disable payment buttons based on items in cart
    const paymentButtons = document.querySelectorAll('.payment-btn:not(.cancel-btn)');
    paymentButtons.forEach(btn => {
        if (currentTransaction.length === 0) {
            btn.disabled = true;
            btn.classList.add('disabled');
        } else {
            btn.disabled = false;
            btn.classList.remove('disabled');
        }
    });
}

// Calculate change
function calculateChange() {
    const receivedAmount = parseFloat(document.getElementById('received-amount')?.value || 0);
    const total = currentTransaction.reduce((sum, sale) => sum + sale.total, 0);
    const change = receivedAmount - total;
    
    const changeElement = document.getElementById('change-amount');
    if (changeElement) {
        changeElement.textContent = `रु${change.toFixed(2)}`;
        
        // Highlight if negative
        if (change < 0 && receivedAmount > 0) {
            changeElement.classList.add('negative-change');
        } else {
            changeElement.classList.remove('negative-change');
        }
    }
}

// Complete payment
window.completePayment = function(method = null) {
    const receivedAmount = parseFloat(document.getElementById('received-amount')?.value || 0);
    const total = currentTransaction.reduce((sum, sale) => sum + sale.total, 0);
    const errorMessage = document.getElementById("error-message");

    if (total === 0) {
        showError("No items in current transaction", errorMessage);
        return;
    }

    if (method !== 'credit' && receivedAmount < total) {
        showError("Insufficient amount received", errorMessage);
        return;
    }

    // Override payment method if specified in button click
    if (method) {
        currentTransaction.forEach(item => {
            item.paymentMethod = method;
        });
    }

    // Update inventory
    if (inventoryModule && typeof inventoryModule.updateInventory === 'function') {
        currentTransaction.forEach(item => {
            inventoryModule.updateInventory(item.productId, item.quantity);
        });
    }

    // Add to daily sales
    dailySales = dailySales.concat(currentTransaction);
    localStorage.setItem('dailySales', JSON.stringify(dailySales));
    
    // Show receipt option
    showReceiptOption();
    
    // Reset current transaction
    currentTransaction = [];
    updateSalesTable();
    updateHistoryTable();
    updateCurrentTransactionTotal();
    updateDashboard();
    updateSalesCharts();
    
    // Show success message
    showSuccess("Payment completed successfully", errorMessage);
    
    // Reset received amount
    document.getElementById('received-amount').value = '';
};

// Show receipt option
function showReceiptOption() {
    const receiptModal = document.createElement('div');
    receiptModal.className = 'receipt-modal';
    receiptModal.innerHTML = `
        <div class="receipt-modal-content">
            <h3>Transaction Complete</h3>
            <p>Would you like to print a receipt?</p>
            <div class="receipt-buttons">
                <button class="receipt-btn" onclick="printReceipt()">Print Receipt</button>
                <button class="skip-btn" onclick="closeReceiptModal()">Skip</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(receiptModal);
    
    // Auto-close after 5 seconds
    setTimeout(closeReceiptModal, 5000);
}

// Close receipt modal
window.closeReceiptModal = function() {
    const modal = document.querySelector('.receipt-modal');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
};

// Print receipt
window.printReceipt = function() {
    // Create receipt window
    const receiptWindow = window.open('', '_blank', 'width=300,height=500');
    
    // Generate receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Receipt</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 10px;
                    width: 80mm;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .store-name {
                    font-size: 16px;
                    font-weight: bold;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                }
                .total-row {
                    font-weight: bold;
                    margin-top: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 10px;
                }
            </style>
        </head>
        <body onload="window.print(); window.setTimeout(function(){ window.close(); }, 500)">
            <div class="header">
                <div class="store-name">V-POS Retail Store</div>
                <div>123 Main Street, City</div>
                <div>Tel: 123-456-7890</div>
                <div>${new Date().toLocaleString()}</div>
            </div>
            
            <div class="divider"></div>
            
            <div>
                ${dailySales.slice(-currentTransaction.length).map(item => `
                    <div class="item-row">
                        <div>${item.productName} (${item.quantity}${item.unitType})</div>
                        <div>रु${item.total.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="item-row total-row">
                <div>TOTAL</div>
                <div>रु${dailySales.slice(-currentTransaction.length).reduce((sum, item) => sum + item.total, 0).toFixed(2)}</div>
            </div>
            
            <div class="item-row">
                <div>Payment Method</div>
                <div>${dailySales.slice(-currentTransaction.length)[0]?.paymentMethod || 'Cash'}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                Thank you for your business!
                <br>
                Developed by: Vishal Basnet
            </div>
        </body>
        </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    closeReceiptModal();
};

// Cancel transaction
window.cancelTransaction = function() {
    if (currentTransaction.length > 0) {
        // Ask for confirmation
        if (!confirm("Are you sure you want to cancel this transaction?")) {
            return;
        }
    }
    
    currentTransaction = [];
    updateSalesTable();
    updateCurrentTransactionTotal();
    document.getElementById('received-amount').value = '';
    document.getElementById('error-message').textContent = '';
};

// Delete item from current transaction
window.deleteItem = function(index) {
    // Add slide-out animation
    const rows = document.querySelectorAll('#sales-body tr');
    rows[index].classList.add('slide-out');
    
    setTimeout(() => {
        currentTransaction.splice(index, 1);
        updateSalesTable();
        updateCurrentTransactionTotal();
    }, 300);
};

// Delete item from history
window.deleteHistoryItem = function(index) {
    if (confirm("Are you sure you want to delete this sale record? This cannot be undone.")) {
        dailySales.splice(index, 1);
        updateHistoryTable();
        updateDashboard();
        updateSalesCharts();
        localStorage.setItem('dailySales', JSON.stringify(dailySales));
    }
};

// Show error message
function showError(message, element) {
    if (!element) return;
    element.textContent = message;
    element.className = 'error-message error';
    element.style.display = 'block';
    
    // Add shake animation
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
    
    setTimeout(() => {
        element.classList.add('fade-out');
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove('fade-out');
        }, 300);
    }, 5000);
}

// Show success message
function showSuccess(message, element) {
    if (!element) return;
    element.textContent = message;
    element.className = 'error-message success';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.classList.add('fade-out');
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove('fade-out');
        }, 300);
    }, 3000);
}

// Export to CSV
window.exportHistoryToCSV = function() {
    const headers = ['Date', 'Product', 'Quantity', 'Unit', 'Price', 'Discount', 'Total', 'Payment Method'];
    const rows = dailySales.map(sale => [
        sale.date,
        sale.productName,
        sale.quantity,
        sale.unitType,
        sale.price,
        sale.discount,
        sale.total,
        sale.paymentMethod
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `sales_history_${new Date().toLocaleDateString()}.csv`);
    a.click();
    
    // Show toast notification
    showToast('Sales history exported successfully');
};

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

// Update sales charts
function updateSalesCharts() {
    updateSalesTrendChart();
    updateTopProductsChart();
}

// Update sales trend chart
function updateSalesTrendChart() {
    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;

    // Group sales by date
    const salesByDate = dailySales.reduce((acc, sale) => {
        if (!acc[sale.date]) {
            acc[sale.date] = 0;
        }
        acc[sale.date] += sale.total;
        return acc;
    }, {});

    // Sort dates and get last 7 days
    const sortedDates = Object.keys(salesByDate).sort();
    const last7Dates = sortedDates.slice(-7);
    const salesData = last7Dates.map(date => salesByDate[date]);
    
    // Format dates for display
    const formattedDates = last7Dates.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedDates,
            datasets: [{
                label: 'Daily Sales (रु)',
                data: salesData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function(context) {
                            return `Sales: रु${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'रु' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Update top products chart
function updateTopProductsChart() {