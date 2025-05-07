let orders = [];
let confirmedOrders = [];
let expenditures = [];
let menuItems = [
  { 
    category: "Appetizers",
    item: "Momo", 
    variants: [
      { name: "Veg", price: 120 },
      { name: "Chicken", price: 150 },
      { name: "Buff", price: 140 }
    ], 
    image: "https://via.placeholder.com/150?text=Momo" 
  },
  { 
    category: "Appetizers",
    item: "Chowmin", 
    variants: [
      { name: "Veg", price: 100 },
      { name: "Chicken", price: 130 }
    ], 
    image: "https://via.placeholder.com/150?text=Chowmin" 
  },
  { 
    category: "Main Course",
    item: "Chicken Curry", 
    price: 250,
    image: "https://via.placeholder.com/150?text=Chicken+Curry" 
  },
  { 
    category: "Rice & Breads",
    item: "Fried Rice", 
    variants: [
      { name: "Veg", price: 120 },
      { name: "Chicken", price: 150 }
    ], 
    image: "https://via.placeholder.com/150?text=Fried+Rice" 
  }
];
let dailySales = 0;
let orderTabs = [];
let currentOrderId = null;

// Show the selected page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
  
  if (pageId === 'dashboard') {
    updateDashboard();
    renderCharts();
  } else if (pageId === 'order-list-page') {
    updateOrderListPage();
  } else if (pageId === 'home') {
    updateDailySales();
    renderCategoryTabs();
    renderProductGrid();
    if (orderTabs.length === 0) createNewOrderTab();
  } else if (pageId === 'expenditure') {
    updateExpenditureList();
  } else if (pageId === 'menu-pricing') {
    updateMenuList();
  }
}

// Utility function to display error messages
function displayErrorMessage(message) {
  const errorContainer = document.getElementById('error-message-container');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  } else {
    console.error('Error container not found:', message);
  }
}

// Render category tabs
function renderCategoryTabs() {
  const categoryTabs = document.getElementById('category-tabs');
  categoryTabs.innerHTML = '';
  
  // Get all unique categories
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  // Add "All" tab
  const allTab = document.createElement('div');
  allTab.className = 'category-tab active';
  allTab.textContent = 'All';
  allTab.onclick = () => {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    allTab.classList.add('active');
    renderProductGrid();
  };
  categoryTabs.appendChild(allTab);
  
  // Add category tabs
  categories.forEach(category => {
    const tab = document.createElement('div');
    tab.className = 'category-tab';
    tab.textContent = category;
    tab.onclick = () => {
      document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
      tab.classList.add('active');
      renderProductGrid(category);
    };
    categoryTabs.appendChild(tab);
  });
}

// Enhanced renderProductGrid with filtering
function renderProductGrid(category = null) {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  
  // Filter items by category if specified
  const filteredItems = category ? 
    menuItems.filter(item => item.category === category) : 
    menuItems;
  
  // Apply search filter if any
  const searchTerm = document.getElementById('menu-search').value.toLowerCase();
  const searchedItems = searchTerm ? 
    filteredItems.filter(item => item.item.toLowerCase().includes(searchTerm)) : 
    filteredItems;
  
  // Group by category if showing all items
  if (!category) {
    const categories = [...new Set(searchedItems.map(item => item.category))];
    
    categories.forEach(category => {
      const itemsInCategory = searchedItems.filter(item => item.category === category);
      if (itemsInCategory.length === 0) return;
      
      const categoryHeader = document.createElement('h3');
      categoryHeader.textContent = category;
      categoryHeader.style.gridColumn = '1 / -1';
      categoryHeader.style.marginTop = '20px';
      categoryHeader.style.marginBottom = '10px';
      categoryHeader.style.color = 'var(--primary-color)';
      categoryHeader.style.borderBottom = '1px solid #444';
      categoryHeader.style.paddingBottom = '5px';
      productGrid.appendChild(categoryHeader);
      
      renderItemsInCategory(itemsInCategory, productGrid);
    });
  } else {
    renderItemsInCategory(searchedItems, productGrid);
  }
}

function renderItemsInCategory(items, container) {
  items.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    if (product.variants && product.variants.length > 0) {
      // Show variant badge
      const variantBadge = document.createElement('div');
      variantBadge.className = 'variant-badge';
      variantBadge.textContent = product.variants.length;
      productCard.appendChild(variantBadge);
      
      productCard.onclick = () => showVariantsForProduct(product);
    } else {
      productCard.onclick = () => {
        addItemToOrder(product.item, null, product.price, 1);
        // Visual feedback
        productCard.style.transform = 'scale(0.95)';
        setTimeout(() => {
          productCard.style.transform = 'scale(1)';
        }, 200);
      };
    }
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.item}" class="product-image">
      <h4>${product.item}</h4>
      ${product.variants ? 
        '<p>Multiple Options</p>' : 
        `<p>रू ${product.price.toFixed(2)}</p>`}
    `;
    
    container.appendChild(productCard);
  });
}

// Filter menu items based on search
function filterMenuItems() {
  const activeTab = document.querySelector('.category-tab.active');
  const category = activeTab.textContent === 'All' ? null : activeTab.textContent;
  renderProductGrid(category);
}

// Enhanced variant selection modal
function showVariantsForProduct(product) {
  const modal = document.getElementById('variant-modal');
  const variantGrid = document.getElementById('variant-grid');
  variantGrid.innerHTML = '';
  
  document.getElementById('selected-item-title').textContent = product.item;
  
  product.variants.forEach(variant => {
    const variantCard = document.createElement('div');
    variantCard.className = 'variant-card';
    
    // Quantity selector
    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'variant-quantity';
    quantityDiv.innerHTML = `
      <button onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.onchange();">-</button>
      <input type="number" min="1" value="1" onchange="this.value = Math.max(1, this.value)">
      <button onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.onchange();">+</button>
    `;
    
    variantCard.innerHTML = `
      <h4>${variant.name}</h4>
      <p>रू ${variant.price.toFixed(2)}</p>
    `;
    variantCard.appendChild(quantityDiv);
    
    variantCard.onclick = function() {
      const quantity = parseInt(this.querySelector('input').value);
      addItemToOrder(product.item, variant.name, variant.price, quantity);
      
      // Visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
        closeVariantModal();
      }, 200);
    };
    
    variantGrid.appendChild(variantCard);
  });
  
  modal.style.display = 'block';
}

function closeVariantModal() {
  document.getElementById('variant-modal').style.display = 'none';
}

// Add item to order directly
function addItemToOrder(item, variant = null, price, quantity = 1) {
  const menuItem = menuItems.find(menu => menu.item === item);
  if (!menuItem) {
    displayErrorMessage('Selected item not found in menu.');
    return;
  }

  // If the item has variants but none was selected
  if (menuItem.variants && menuItem.variants.length > 0 && !variant) {
    showVariantsForProduct(menuItem);
    return;
  }

  // If we have a variant, get its price
  let finalPrice = price;
  if (variant && menuItem.variants) {
    const selectedVariant = menuItem.variants.find(v => v.name === variant);
    if (selectedVariant) {
      finalPrice = selectedVariant.price;
    }
  } else if (!variant) {
    finalPrice = menuItem.price;
  }

  const total = finalPrice * quantity;
  const orderItem = { 
    item, 
    variant: variant || null,
    price: finalPrice, 
    quantity, 
    total, 
    date: new Date().toISOString() 
  };
  
  // Add to current order tab
  const currentOrder = orderTabs.find(o => o.id === currentOrderId);
  if (currentOrder) {
    currentOrder.items.push(orderItem);
    orders = currentOrder.items;
    updateOrderList();
  } else {
    orders.push(orderItem);
    updateOrderList();
  }
}

// Update the order list with editable quantities
function updateOrderList() {
  const orderList = document.getElementById('order-list').getElementsByTagName('tbody')[0];
  orderList.innerHTML = '';

  if (orders.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6">No items in current order</td>';
    orderList.appendChild(row);
    updateOrderTotal();
    return;
  }

  orders.forEach((order, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.item}</td>
      <td>${order.variant || 'N/A'}</td>
      <td>रू ${order.price.toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${order.quantity}" 
               onchange="updateOrderQuantity(${index}, this.value)" 
               style="width: 60px;">
      </td>
      <td>रू ${order.total.toFixed(2)}</td>
      <td>
        <button onclick="removeOrder(${index})" class="danger-btn">Remove</button>
      </td>
    `;
    orderList.appendChild(row);
  });
  
  updateOrderTotal();
}

// Update quantity for a specific order item
function updateOrderQuantity(index, newQuantity) {
  newQuantity = parseInt(newQuantity);
  if (isNaN(newQuantity) || newQuantity < 1) {
    displayErrorMessage('Please enter a valid quantity');
    return;
  }
  
  orders[index].quantity = newQuantity;
  orders[index].total = orders[index].price * newQuantity;
  updateOrderList();
}

// Process payment amount
function processPayment() {
  const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  
  if (isNaN(paymentAmount)) {
    displayErrorMessage('Please enter a valid payment amount');
    return;
  }
  
  if (paymentAmount < orderTotal) {
    displayErrorMessage('Payment amount is less than order total');
    return;
  }
  
  document.getElementById('amount-paid').textContent = paymentAmount.toFixed(2);
  document.getElementById('change-amount').textContent = (paymentAmount - orderTotal).toFixed(2);
  document.getElementById('confirm-payment-btn').disabled = false;
}

// Confirm payment
function confirmPayment() {
  if (orders.length === 0) {
    displayErrorMessage('Please add items to the order first.');
    return;
  }

  const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  
  if (paymentAmount < orderTotal) {
    displayErrorMessage('Payment amount is less than order total');
    return;
  }

  const timestamp = new Date().toISOString();
  const orderWithTimestamp = orders.map(order => ({
    ...order,
    timestamp,
    date: new Date().toLocaleDateString(),
    amountPaid: paymentAmount,
    changeGiven: paymentAmount - order.total
  }));
  
  confirmedOrders = confirmedOrders.concat(orderWithTimestamp);
  dailySales += orderTotal;
  
  // Reset payment UI
  document.getElementById('payment-amount').value = '';
  document.getElementById('amount-paid').textContent = '0.00';
  document.getElementById('change-amount').textContent = '0.00';
  document.getElementById('confirm-payment-btn').disabled = true;
  
  // Clear current order tab
  const currentOrder = orderTabs.find(o => o.id === currentOrderId);
  if (currentOrder) {
    currentOrder.items = [];
    orders = [];
  }
  
  updateOrderList();
  updateDailySales();
  updateDashboard();
  saveToLocalStorage();
  
  displayErrorMessage('Payment confirmed successfully!');
  printReceipt(timestamp);
}

// Update order total display
function updateOrderTotal() {
  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  document.getElementById('order-total-amount').textContent = orderTotal.toFixed(2);
  
  // Reset payment section when order changes
  document.getElementById('payment-amount').value = '';
  document.getElementById('amount-paid').textContent = '0.00';
  document.getElementById('change-amount').textContent = '0.00';
  document.getElementById('confirm-payment-btn').disabled = true;
}

// Add an expenditure
function addExpenditure() {
  const description = document.getElementById('expense-description').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);

  if (!description || isNaN(amount) || amount <= 0) {
    displayErrorMessage('Please fill all fields correctly.');
    return;
  }

  expenditures.push({ 
    description, 
    amount, 
    date: new Date().toLocaleDateString() 
  });
  
  updateExpenditureList();
  clearExpenseInputs();

  // Save to local storage
  saveToLocalStorage();
  updateDashboard();
}

// Add a menu item with variants
function addMenuItem() {
  const category = document.getElementById('menu-category').value;
  const item = document.getElementById('menu-item').value;
  const variantInputs = document.querySelectorAll('[id^="menu-variant-"]');
  const priceInputs = document.querySelectorAll('[id^="menu-price-"]');
  const image = document.getElementById('menu-image').value;

  if (!category || !item) {
    alert('Please select a category and enter an item name.');
    return;
  }

  // Collect variants and prices
  const variants = [];
  for (let i = 0; i < variantInputs.length; i++) {
    const variantName = variantInputs[i].value;
    const variantPrice = parseFloat(priceInputs[i].value);

    if (!variantName || isNaN(variantPrice)) {
      alert(`Please fill all variant fields correctly for variant ${i+1}.`);
      return;
    }

    variants.push({
      name: variantName,
      price: variantPrice
    });
  }

  if (variants.length === 0 && !priceInputs[0].value) {
    alert('Please add at least one variant or set a price.');
    return;
  }

  // Add to menu items
  menuItems.push({ 
    category,
    item, 
    variants: variants.length > 0 ? variants : undefined, 
    price: variants.length === 0 ? parseFloat(priceInputs[0].value) : undefined,
    image: image || "https://via.placeholder.com/150?text=No+Image" 
  });
  
  updateMenuList();
  clearMenuInputs();
  renderCategoryTabs();
  renderProductGrid();
  saveToLocalStorage();
}

// Add variant input fields
function addVariantInput() {
  const variantInputs = document.getElementById('variant-inputs');
  const newIndex = document.querySelectorAll('[id^="menu-variant-"]').length + 1;
  
  const variantDiv = document.createElement('div');
  variantDiv.className = 'variant-input-group';
  variantDiv.innerHTML = `
    <input type="text" id="menu-variant-${newIndex}" placeholder="Variant ${newIndex} Name">
    <input type="number" id="menu-price-${newIndex}" min="0" step="0.01" placeholder="Variant ${newIndex} Price">
  `;
  
  variantInputs.appendChild(variantDiv);
}

// Update the expenditure list
function updateExpenditureList() {
  const expenditureList = document.getElementById('expenditure-list').getElementsByTagName('tbody')[0];
  expenditureList.innerHTML = '';

  if (expenditures.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4">No expenditures recorded</td>';
    expenditureList.appendChild(row);
    return;
  }

  expenditures.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>रू ${expense.amount.toFixed(2)}</td>
      <td>${expense.date}</td>
      <td><button onclick="removeExpenditure(${index})" class="danger-btn">Remove</button></td>
    `;
    expenditureList.appendChild(row);
  });
}

// Remove an expenditure
function removeExpenditure(index) {
  if (confirm('Are you sure you want to remove this expenditure?')) {
    expenditures.splice(index, 1);
    updateExpenditureList();
    saveToLocalStorage();
    updateDashboard();
  }
}

// Update the menu list with variants
function updateMenuList() {
  const menuList = document.getElementById('menu-list').getElementsByTagName('tbody')[0];
  menuList.innerHTML = '';

  if (menuItems.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No menu items available</td>';
    menuList.appendChild(row);
    return;
  }

  menuItems.forEach((menu, index) => {
    const row = document.createElement('tr');
    
    // Create variants display text
    let variantsText = 'No variants';
    if (menu.variants && menu.variants.length > 0) {
      variantsText = menu.variants.map(v => `${v.name} (रू ${v.price.toFixed(2)})`).join(', ');
    } else if (menu.price) {
      variantsText = `Standard: रू ${menu.price.toFixed(2)}`;
    }
    
    row.innerHTML = `
      <td>${menu.category}</td>
      <td>${menu.item}</td>
      <td>${variantsText}</td>
      <td><img src="${menu.image}" alt="${menu.item}" style="width:50px;height:50px;object-fit:cover;"></td>
      <td>
        <button onclick="removeMenuItem(${index})" class="danger-btn">Remove</button>
        <button onclick="editMenuItem(${index})" class="primary-btn" style="margin-left:5px;">Edit</button>
      </td>
    `;
    menuList.appendChild(row);
  });
}

// Edit a menu item
function editMenuItem(index) {
  const item = menuItems[index];
  document.getElementById('menu-category').value = item.category;
  document.getElementById('menu-item').value = item.item;
  document.getElementById('menu-image').value = item.image;
  
  // Clear variant inputs
  const variantInputs = document.getElementById('variant-inputs');
  variantInputs.innerHTML = '';
  
  // Add variant inputs
  if (item.variants && item.variants.length > 0) {
    item.variants.forEach((variant, i) => {
      const variantDiv = document.createElement('div');
      variantDiv.className = 'variant-input-group';
      variantDiv.innerHTML = `
        <input type="text" id="menu-variant-${i+1}" placeholder="Variant ${i+1} Name" value="${variant.name}">
        <input type="number" id="menu-price-${i+1}" min="0" step="0.01" placeholder="Variant ${i+1} Price" value="${variant.price}">
      `;
      variantInputs.appendChild(variantDiv);
    });
  } else {
    // For items without variants, show price in first variant field
    const variantDiv = document.createElement('div');
    variantDiv.className = 'variant-input-group';
    variantDiv.innerHTML = `
      <input type="text" id="menu-variant-1" placeholder="Variant 1 Name" value="Standard">
      <input type="number" id="menu-price-1" min="0" step="0.01" placeholder="Variant 1 Price" value="${item.price}">
    `;
    variantInputs.appendChild(variantDiv);
  }
  
  // Remove the item from the array
  menuItems.splice(index, 1);
  
  // Scroll to the form
  document.getElementById('menu-item').scrollIntoView({ behavior: 'smooth' });
}

// Update the order list page with variants
function updateOrderListPage() {
  const allOrdersList = document.getElementById('all-orders-list').getElementsByTagName('tbody')[0];
  allOrdersList.innerHTML = '';

  if (confirmedOrders.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6">No order history available</td>';
    allOrdersList.appendChild(row);
    return;
  }

  confirmedOrders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.item}</td>
      <td>${order.variant || 'N/A'}</td>
      <td>रू ${order.price.toFixed(2)}</td>
      <td>${order.quantity}</td>
      <td>रू ${order.total.toFixed(2)}</td>
      <td>${order.date || 'N/A'}</td>
    `;
    allOrdersList.appendChild(row);
  });
}

// Update the dashboard
function updateDashboard() {
  const totalSales = confirmedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalExpenditures = expenditures.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalSales - totalExpenditures;

  document.getElementById('total-sales').textContent = totalSales.toFixed(2);
  document.getElementById('total-expenditures').textContent = totalExpenditures.toFixed(2);
  document.getElementById('net-profit').textContent = netProfit.toFixed(2);

  // Calculate today's sales
  const today = new Date().toLocaleDateString();
  const todaySales = confirmedOrders
    .filter(order => order.date === today)
    .reduce((sum, order) => sum + order.total, 0);
  
  document.getElementById('today-sales').textContent = todaySales.toFixed(2);

  updateTopItems();
  updateSalesAnalytics();
  renderCharts();
}

// Update sales analytics
function updateSalesAnalytics() {
  // Get sales by date
  const salesByDate = confirmedOrders.reduce((acc, order) => {
    const date = order.date || 'Unknown';
    acc[date] = (acc[date] || 0) + order.total;
    return acc;
  }, {});

  // Get sales by item
  const salesByItem = confirmedOrders.reduce((acc, order) => {
    acc[order.item] = (acc[order.item] || 0) + order.total;
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(salesByDate).sort((a, b) => {
    try {
      return new Date(a) - new Date(b);
    } catch (e) {
      return 0;
    }
  });
  const last7Dates = sortedDates.slice(-7);
  
  // Prepare data for weekly trend chart
  const weeklyData = {
    labels: last7Dates,
    values: last7Dates.map(date => salesByDate[date] || 0)
  };

  // Update the weekly trend chart
  renderWeeklyTrendChart(weeklyData);
}

// Update top 5 selling items
function updateTopItems() {
  const itemSales = confirmedOrders.reduce((acc, order) => {
    acc[order.item] = (acc[order.item] || 0) + order.total;
    return acc;
  }, {});

  const sortedItems = Object.keys(itemSales)
    .sort((a, b) => itemSales[b] - itemSales[a])
    .slice(0, 5);

  const topItemsList = document.getElementById('top-items-list');
  topItemsList.innerHTML = '';

  sortedItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item}: रू ${itemSales[item].toFixed(2)}`;
    topItemsList.appendChild(li);
  });

  document.getElementById('top-items-message').textContent = 
    sortedItems.length > 0 ? 'Wow, these items have a higher selling rate!' : '';
}

// Update daily sales display
function updateDailySales() {
  document.getElementById('daily-sales-amount').textContent = dailySales.toFixed(2);
}

// Reset daily sales
function resetDailySales() {
  if (confirm('Are you sure you want to reset daily sales?')) {
    dailySales = 0;
    updateDailySales();
    localStorage.setItem('dailySales', dailySales);
    alert('Daily sales have been reset');
  }
}

// Render charts
function renderCharts() {
  const salesData = confirmedOrders.reduce((acc, order) => {
    acc[order.item] = (acc[order.item] || 0) + order.total;
    return acc;
  }, {});

  // Prepare data
  const labels = Object.keys(salesData);
  const data = Object.values(salesData);

  // Only render charts if we have data
  if (labels.length > 0) {
    const backgroundColors = generateColors(labels.length);

    // Donut Chart - Sales Distribution
    if (document.getElementById('donutChart').chart) {
      document.getElementById('donutChart').chart.destroy();
    }
    
    const donutCtx = document.getElementById('donutChart').getContext('2d');
    document.getElementById('donutChart').chart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#fff'
            }
          },
          title: {
            display: true,
            text: 'Sales Distribution by Item',
            color: 'var(--primary-color)',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  // Line Chart - Sales Trend by Order (only if we have orders)
  if (confirmedOrders.length > 0) {
    if (document.getElementById('lineChart').chart) {
      document.getElementById('lineChart').chart.destroy();
    }
    
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    document.getElementById('lineChart').chart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: Array.from({ length: confirmedOrders.length }, (_, i) => `Order ${i + 1}`),
        datasets: [{
          label: 'Sales Trend',
          data: confirmedOrders.map(order => order.total),
          borderColor: 'var(--primary-color)',
          backgroundColor: 'rgba(0, 209, 178, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#fff'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#fff'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        }
      }
    });
  }
}

// Render weekly trend chart
function renderWeeklyTrendChart(data) {
  if (data.labels.length === 0) return;

  if (document.getElementById('weeklyChart').chart) {
    document.getElementById('weeklyChart').chart.destroy();
  }
  
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  document.getElementById('weeklyChart').chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Daily Sales',
        data: data.values,
        backgroundColor: 'rgba(0, 209, 178, 0.7)',
        borderColor: 'var(--primary-color)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#fff'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#fff'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        title: {
          display: true,
          text: 'Sales Trend (Last 7 Days)',
          color: 'var(--primary-color)',
          font: {
            size: 16
          }
        }
      }
    }
  });
}

// Generate colors for charts
function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#8AC94A', '#EA5F89', '#45B7D1', '#FFCD56'
  ];
  
  // If we need more colors than in our predefined array, generate them
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
  }
  
  return colors.slice(0, count);
}

// Remove an order
function removeOrder(index) {
  orders.splice(index, 1);
  updateOrderList();
}

// Remove a menu item
function removeMenuItem(index) {
  if (confirm('Are you sure you want to remove this menu item?')) {
    menuItems.splice(index, 1);
    updateMenuList();
    renderCategoryTabs();
    renderProductGrid();
    saveToLocalStorage();
  }
}

// Remove all orders
function removeAllOrders() {
  if (orders.length === 0) return;
  if (confirm('Are you sure you want to remove all items from the current order?')) {
    orders = [];
    updateOrderList();
    document.getElementById('confirm-payment-btn').disabled = true;
  }
}

// Remove all expenditures
function removeAllExpenditures() {
  if (expenditures.length === 0) return;
  if (confirm('Are you sure you want to remove all expenditures?')) {
    expenditures = [];
    updateExpenditureList();
    saveToLocalStorage();
    updateDashboard();
  }
}

// Remove all menu items
function removeAllMenuItems() {
  if (menuItems.length === 0) return;
  if (confirm('Are you sure you want to remove all menu items?')) {
    menuItems = [];
    updateMenuList();
    renderCategoryTabs();
    renderProductGrid();
    saveToLocalStorage();
  }
}
/////////////////////////////////////////

// Export expenditure to CSV
function exporexpendituresToCSV() {
  if (expenditures.length === 0) {
    alert('No expenditure to export');
    return;
  }

  // Create header row
  const headers = "Description,Amount,Date\n";
  
  // Create data rows
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers
    + expenditures.map(item => 
        `"${item.description}",${item.amount},"${item.date || ''}"`
      ).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenditure.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}







////////////////////////////////////
// Export to CSV
function exportToCSV() {
  if (confirmedOrders.length === 0) {
    alert('No orders to export');
    return;
  }

  // Create header row
  const headers = "Item,Variant,Price,Quantity,Total,Date\n";
  
  // Create data rows
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers
    + confirmedOrders.map(order => 
        `${order.item},${order.variant || ''},${order.price},${order.quantity},${order.total},${order.date || ''}`
      ).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export menu to CSV
function exportMenuToCSV() {
  if (menuItems.length === 0) {
    alert('No menu items to export');
    return;
  }

  // Create header row
  const headers = "Category,Item,Variants,Image URL\n";
  
  // Create data rows
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers
    + menuItems.map(item => {
        let variantsText = '';
        if (item.variants && item.variants.length > 0) {
          variantsText = item.variants.map(v => `${v.name}:${v.price}`).join(';');
        } else if (item.price) {
          variantsText = `Standard:${item.price}`;
        }
        return `"${item.category}","${item.item}","${variantsText}","${item.image}"`;
      }).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "menu_items.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear expense inputs
function clearExpenseInputs() {
  document.getElementById('expense-description').value = '';
  document.getElementById('expense-amount').value = '';
}

// Clear menu inputs
function clearMenuInputs() {
  document.getElementById('menu-category').value = '';
  document.getElementById('menu-item').value = '';
  document.getElementById('menu-image').value = '';
  
  // Clear all variant inputs except the first one
  const variantInputs = document.getElementById('variant-inputs');
  variantInputs.innerHTML = `
    <input type="text" id="menu-variant-1" placeholder="Variant 1 Name">
    <input type="number" id="menu-price-1" min="0" step="0.01" placeholder="Variant 1 Price">
  `;
}

// Save all data to local storage
function saveToLocalStorage() {
  localStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders));
  localStorage.setItem('expenditures', JSON.stringify(expenditures));
  localStorage.setItem('menuItems', JSON.stringify(menuItems));
  localStorage.setItem('dailySales', dailySales);
  localStorage.setItem('orderTabs', JSON.stringify(orderTabs));
  localStorage.setItem('currentOrderId', currentOrderId);
}

// Load data from local storage on page load
function loadDataFromLocalStorage() {
  try {
    const storedConfirmedOrders = localStorage.getItem('confirmedOrders');
    const storedExpenditures = localStorage.getItem('expenditures');
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedDailySales = localStorage.getItem('dailySales');
    const storedOrderTabs = localStorage.getItem('orderTabs');
    const storedCurrentOrderId = localStorage.getItem('currentOrderId');

    if (storedConfirmedOrders) {
      confirmedOrders = JSON.parse(storedConfirmedOrders) || [];
    }

    if (storedExpenditures) {
      expenditures = JSON.parse(storedExpenditures) || [];
    }
    
    if (storedMenuItems) {
      menuItems = JSON.parse(storedMenuItems) || [];
    }
    
    if (storedDailySales) {
      dailySales = parseFloat(storedDailySales) || 0;
    }
    
    if (storedOrderTabs) {
      orderTabs = JSON.parse(storedOrderTabs) || [];
    }
    
    if (storedCurrentOrderId) {
      currentOrderId = storedCurrentOrderId;
    }
    
    // Load theme colors
    loadTheme();
  } catch (e) {
    console.error('Error loading data from localStorage:', e);
    // Reset to defaults if loading fails
    confirmedOrders = [];
    expenditures = [];
    menuItems = [
      { 
        category: "Appetizers",
        item: "Momo", 
        variants: [
          { name: "Veg", price: 120 },
          { name: "Chicken", price: 150 },
          { name: "Buff", price: 140 }
        ], 
        image: "https://via.placeholder.com/150?text=Momo" 
      },
      { 
        category: "Appetizers",
        item: "Chowmin", 
        variants: [
          { name: "Veg", price: 100 },
          { name: "Chicken", price: 130 }
        ], 
        image: "https://via.placeholder.com/150?text=Chowmin" 
      },
      { 
        category: "Main Course",
        item: "Chicken Curry", 
        price: 250,
        image: "https://via.placeholder.com/150?text=Chicken+Curry" 
      },
      { 
        category: "Rice & Breads",
        item: "Fried Rice", 
        variants: [
          { name: "Veg", price: 120 },
          { name: "Chicken", price: 150 }
        ], 
        image: "https://via.placeholder.com/150?text=Fried+Rice" 
      }
    ];
    dailySales = 0;
    orderTabs = [];
    currentOrderId = null;
  }

  // Update the UI with the loaded data
  updateOrderListPage();
  updateExpenditureList();
  updateMenuList();
  updateDailySales();
  updateDashboard();
  renderCategoryTabs();
  renderProductGrid();
  renderOrderTabs();
  
  // Set current orders
  if (currentOrderId) {
    const currentOrder = orderTabs.find(o => o.id === currentOrderId);
    if (currentOrder) {
      orders = currentOrder.items;
      updateOrderList();
    }
  }
}

// Clear all data from local storage
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    localStorage.clear();
    confirmedOrders = [];
    expenditures = [];
    menuItems = [
      { 
        category: "Appetizers",
        item: "Momo", 
        variants: [
          { name: "Veg", price: 120 },
          { name: "Chicken", price: 150 },
          { name: "Buff", price: 140 }
        ], 
        image: "https://via.placeholder.com/150?text=Momo" 
      },
      { 
        category: "Appetizers",
        item: "Chowmin", 
        variants: [
          { name: "Veg", price: 100 },
          { name: "Chicken", price: 130 }
        ], 
        image: "https://via.placeholder.com/150?text=Chowmin" 
      },
      { 
        category: "Main Course",
        item: "Chicken Curry", 
        price: 250,
        image: "https://via.placeholder.com/150?text=Chicken+Curry" 
      },
      { 
        category: "Rice & Breads",
        item: "Fried Rice", 
        variants: [
          { name: "Veg", price: 120 },
          { name: "Chicken", price: 150 }
        ], 
        image: "https://via.placeholder.com/150?text=Fried+Rice" 
      }
    ];
    dailySales = 0;
    orders = [];
    orderTabs = [];
    currentOrderId = null;
    
    updateOrderList();
    updateOrderListPage();
    updateExpenditureList();
    updateMenuList();
    updateDailySales();
    updateDashboard();
    renderCategoryTabs();
    renderProductGrid();
    renderOrderTabs();
    
    alert('All data has been cleared. Default menu items restored.');
  }
}

// Filter orders by date range
function filterOrdersByDate() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Set to end of day
  
  const filteredOrders = confirmedOrders.filter(order => {
    try {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    } catch (e) {
      console.error('Error parsing order date:', order.date, e);
      return false;
    }
  });
  
  displayFilteredOrders(filteredOrders);
}

// Clear date filter
function clearDateFilter() {
  document.getElementById('start-date').value = '';
  document.getElementById('end-date').value = '';
  updateOrderListPage();
}

// Display filtered orders
function displayFilteredOrders(filteredOrders) {
  const allOrdersList = document.getElementById('all-orders-list').getElementsByTagName('tbody')[0];
  allOrdersList.innerHTML = '';

  if (filteredOrders.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6">No orders found in the selected date range.</td>';
    allOrdersList.appendChild(row);
    return;
  }

  filteredOrders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.item}</td>
      <td>${order.variant || 'N/A'}</td>
      <td>रू ${order.price.toFixed(2)}</td>
      <td>${order.quantity}</td>
      <td>रू ${order.total.toFixed(2)}</td>
      <td>${order.date || 'N/A'}</td>
    `;
    allOrdersList.appendChild(row);
  });
}

// Print receipt
function printReceipt(orderId = null) {
  const ordersToPrint = orderId ? 
    confirmedOrders.filter(o => o.timestamp === orderId) : 
    orders;
  
  if (ordersToPrint.length === 0) {
    alert("No items to print");
    return;
  }

  const printWindow = window.open('', '_blank');
  const orderTotal = ordersToPrint.reduce((sum, o) => sum + o.total, 0);
  const date = new Date().toLocaleString();
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: Arial; width: 80mm; padding: 10px; }
        .header { text-align: center; margin-bottom: 10px; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; }
        .footer { text-align: center; margin-top: 15px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${localStorage.getItem('restaurantName') || ' Receipt'}</h2>
        <p>${date}</p>
      </div>
      
      ${ordersToPrint.map(o => `
        <div class="item">
          <span>${o.item} ${o.variant ? `(${o.variant})` : ''} × ${o.quantity}</span>
          <span>रू ${o.total.toFixed(2)}</span>
        </div>
      `).join('')}
      
      <div class="item total">
        <span>TOTAL:</span>
        <span>रू ${orderTotal.toFixed(2)}</span>
      </div>
      
      <div class="footer">
        <p>Thank you for dining with us!</p>
      </div>
      
      <script>
        setTimeout(() => {
          window.print();
          window.close();
        }, 200);
      </script>
    </body>
    </html>
  `);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  
  // 1-9: Quick category selection
  if (e.key >= '1' && e.key <= '9') {
    const tabs = document.querySelectorAll('.category-tab');
    if (tabs.length >= parseInt(e.key)) {
      tabs[e.key === '9' ? tabs.length - 1 : parseInt(e.key) - 1].click();
    }
  }
  
  // Hotkeys
  switch(e.key.toLowerCase()) {
    case 'p': printReceipt(); break;
    case 's': document.getElementById('menu-search').focus(); break;
    case 'c': document.getElementById('payment-amount').focus(); break;
    case 'a': document.querySelector('.primary-btn')?.click(); break;
  }
});

// Theme customization
function openThemeSettings() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <h2>Theme Customization</h2>
      <div class="form-group">
        <label>Primary Color</label>
        <input type="color" id="primary-color" value="${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')}">
      </div>
      <div class="form-group">
        <label>Secondary Color</label>
        <input type="color" id="secondary-color" value="${getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')}">
      </div>
      <div class="form-group">
        <label>Accent Color</label>
        <input type="color" id="accent-color" value="${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')}">
      </div>
      <button onclick="saveTheme()" class="primary-btn">Save</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveTheme() {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', document.getElementById('primary-color').value);
  root.style.setProperty('--secondary-color', document.getElementById('secondary-color').value);
  root.style.setProperty('--accent-color', document.getElementById('accent-color').value);
  localStorage.setItem('themeColors', JSON.stringify({
    primary: document.getElementById('primary-color').value,
    secondary: document.getElementById('secondary-color').value,
    accent: document.getElementById('accent-color').value
  }));
  document.querySelector('.modal').remove();
}

function loadTheme() {
  const saved = JSON.parse(localStorage.getItem('themeColors'));
  if (saved) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', saved.primary);
    root.style.setProperty('--secondary-color', saved.secondary);
    root.style.setProperty('--accent-color', saved.accent);
  }
}

// Advanced analytics
function showAdvancedAnalytics() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Generate time-based analytics
  const hourlySales = Array(24).fill(0);
  confirmedOrders.forEach(o => {
    const hour = new Date(o.timestamp).getHours();
    hourlySales[hour] += o.total;
  });
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <h2>Advanced Analytics</h2>
      <div class="chart-container">
        <canvas id="hourlyChart" width="400" height="200"></canvas>
      </div>
      <div class="analytics-grid">
        <div class="metric-card">
          <h3>Avg. Order Value</h3>
          <p>रू ${(confirmedOrders.reduce((a,b) => a + b.total, 0) / (confirmedOrders.length || 1)).toFixed(2)}</p>
        </div>
        <div class="metric-card">
          <h3>Busiest Hour</h3>
          <p>${hourlySales.indexOf(Math.max(...hourlySales))}:00</p>
        </div>
      </div>
      <button onclick="this.closest('.modal').remove()" class="primary-btn">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Render hourly chart
  const ctx = modal.querySelector('#hourlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array(24).fill().map((_,i) => `${i}:00`),
      datasets: [{
        label: 'Sales by Hour',
        data: hourlySales,
        backgroundColor: 'rgba(0, 209, 178, 0.7)'
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
}

// Multi-order management
function createNewOrderTab() {
  const orderId = Date.now();
  orderTabs.push({
    id: orderId,
    name: `Order ${orderTabs.length + 1}`,
    items: []
  });
  switchOrderTab(orderId);
  saveToLocalStorage();
}

function switchOrderTab(orderId) {
  currentOrderId = orderId;
  const order = orderTabs.find(o => o.id === orderId);
  if (order) {
    orders = order.items;
    updateOrderList();
  }
  renderOrderTabs();
  saveToLocalStorage();
}

function renderOrderTabs() {
  const container = document.getElementById('order-tabs');
  container.innerHTML = orderTabs.map(order => `
    <div class="order-tab ${order.id === currentOrderId ? 'active' : ''}" 
         data-order-id="${order.id}" 
         onclick="switchOrderTab(${order.id})">
      ${order.name}
      <span class="close-tab" onclick="event.stopPropagation(); closeOrderTab(${order.id})">×</span>
    </div>
  `).join('');
  
  if (orderTabs.length === 0) createNewOrderTab();
}

function closeOrderTab(orderId) {
  if (orderTabs.length <= 1) return;
  
  const index = orderTabs.findIndex(o => o.id === orderId);
  orderTabs.splice(index, 1);
  
  if (currentOrderId === orderId) {
    switchOrderTab(orderTabs[0].id);
  }
  renderOrderTabs();
  saveToLocalStorage();
}

// Show home page by default
window.onload = function() {
  loadDataFromLocalStorage();
  showPage('home');
};