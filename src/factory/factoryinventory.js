export function updateInventory(productId, quantity) {
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    let productIndex = inventory.findIndex(item => item.serial === productId);
    if (productIndex !== -1) {
        inventory[productIndex].quantity -= quantity;
        if (inventory[productIndex].quantity < 0) {
            inventory[productIndex].quantity = 0;
            // Replace alert with error message popup
            const errorMessageElement = document.getElementById("error-message");
            if (errorMessageElement) {
                errorMessageElement.textContent = `Warning: ${inventory[productIndex].name} is out of stock! please re-stock.`;
                errorMessageElement.style.color = "red";
                errorMessageElement.style.display = "block";
            }
        }
        localStorage.setItem("inventory", JSON.stringify(inventory));
    }
}

document.addEventListener("DOMContentLoaded", function () {
    displayInventory();
    document.getElementById("productForm")?.addEventListener("submit", addProduct);
});

function addProduct(event) {
    event.preventDefault();
    let product = {
        serial: document.getElementById("serial").value,
        name: document.getElementById("name").value,
        quantity: parseInt(document.getElementById("quantity").value),
        price: parseFloat(document.getElementById("price").value),
        expiry: document.getElementById("expiry").value,
        addedDate: new Date().toISOString().split('T')[0]
    };
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    inventory.push(product);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    displayInventory();
    event.target.reset();
}

function displayInventory() {
    let table = document.getElementById("inventoryTable");
    if (!table) return;
    table.innerHTML = "";
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    inventory.forEach((product, index) => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${product.serial}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price}</td>
            <td>${product.addedDate}</td>
            <td>${product.expiry}</td>
            <td><button onclick="removeProduct(${index})">Remove</button></td>
        `;
    });
    checkExpiry();
}

window.removeProduct = function (index) {
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    displayInventory();
};

function checkExpiry() {
    let today = new Date();
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    let warningMessageElement = document.getElementById("warning-message");
    if (!warningMessageElement) return;
    
    warningMessageElement.textContent = "";
    inventory.forEach(product => {
        let expiryDate = new Date(product.expiry);
        let timeDiff = expiryDate - today;
        let daysRemaining = timeDiff / (1000 * 60 * 60 * 24);
        if (daysRemaining <= 14 && daysRemaining > 0) {
            warningMessageElement.textContent = `Product "${product.name}" is about to expire in ${Math.ceil(daysRemaining)} days!`;
            warningMessageElement.style.color = "orange";
            warningMessageElement.style.display = "block";
        } else if (daysRemaining <= 0) {
            warningMessageElement.textContent = `Product "${product.name}" has expired!`;
            warningMessageElement.style.color = "red";
            warningMessageElement.style.display = "block";
        }
    });
}

// Export to CSV functionality
window.exportCSV = function() {
    const headers = ['Serial', 'Product', 'Quantity', 'Price', 'Added Date', 'Expiry'];
    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    const rows = inventory.map(product => [
        product.serial,
        product.name,
        product.quantity,
        product.price,
        product.addedDate,
        product.expiry
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventory_${new Date().toLocaleDateString()}.csv`);
    a.click();
};