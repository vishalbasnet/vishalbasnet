(localStorage.getItem('inventory')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let production = JSON.parse(localStorage.getItem('production')) || [];

// Dashboard - Update Overview
function updateDashboard() {
    if (document.getElementById('totalInventory')) {
        document.getElementById('totalInventory').textContent = inventory.length;
        document.getElementById('totalEmployees').textContent = employees.length;

        // Calculate Production Rate and Total Production Cost
        const totalProduction = production.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        const totalProductionCost = production.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)), 0);
        document.getElementById('productionRate').textContent = `${totalProduction} items produced`;
        document.getElementById('totalProductionCost').textContent = `₹${totalProductionCost.toFixed(2)}`;

        // Calculate Break-even Point
        const totalRevenue = totalProduction * 100; // Assuming ₹100 per unit revenue
        const breakEvenPoint = totalProductionCost / 100; // Assuming ₹100 per unit revenue
        document.getElementById('breakEvenPoint').textContent = `${breakEvenPoint.toFixed(2)} units`;

        // Risk Analysis
        const risk = totalRevenue - totalProductionCost;
        document.getElementById('riskAnalysis').textContent = risk >= 0 ? `Profit: ₹${risk.toFixed(2)}` : `Loss: ₹${Math.abs(risk).toFixed(2)}`;
    }
}

// Charts - Render Bar Chart and Pie Chart
function initializeCharts() {
    if (document.getElementById('barChart') && typeof Chart !== 'undefined') {
        const barChartCtx = document.getElementById('barChart').getContext('2d');
        const pieChartCtx = document.getElementById('pieChart').getContext('2d');

        // Bar Chart Data
        const barChart = new Chart(barChartCtx, {
            type: 'bar',
            data: {
                labels: ['Inventory', 'Employees', 'Production'],
                datasets: [{
                    label: 'Count',
                    data: [inventory.length, employees.length, production.length],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(34, 179, 211, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Pie Chart Data
        const pieChart = new Chart(pieChartCtx, {
            type: 'pie',
            data: {
                labels: ['Inventory', 'Employees', 'Production'],
                datasets: [{
                    label: 'Distribution',
                    data: [inventory.length, employees.length, production.length],
                    backgroundColor: [
                        'rgba(25, 211, 211, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(14, 122, 194, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgb(214, 18, 61)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Inventory - Add Item
function setupInventoryForm() {
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const itemName = document.getElementById('itemName').value;
            const itemQuantity = document.getElementById('itemQuantity').value;
            inventory.push({ name: itemName, quantity: itemQuantity });
            localStorage.setItem('inventory', JSON.stringify(inventory));
            alert('Item added to inventory!');
            window.location.href = 'inventory.html';
        });
    }
}

// Display Inventory List
function displayInventory() {
    const inventoryList = document.getElementById('inventoryList');
    if (inventoryList) {
        inventoryList.innerHTML = inventory.map(item => `
            <li>${item.name} - ${item.quantity} units</li>
        `).join('');
    }
}

// Employees - Add Employee
function setupEmployeeForm() {
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const employeeName = document.getElementById('employeeName').value;
            const employeeRole = document.getElementById('employeeRole').value;
            const employeeSalary = document.getElementById('employeeSalary').value;
            const employeeStartDate = document.getElementById('employeeStartDate').value;
            const employeeYears = document.getElementById('employeeYears').value;
            const employeeDepartment = document.getElementById('employeeDepartment').value;
            
            employees.push({ 
                name: employeeName, 
                role: employeeRole, 
                salary: parseFloat(employeeSalary), 
                startDate: employeeStartDate, 
                years: parseInt(employeeYears), 
                department: employeeDepartment 
            });
            
            localStorage.setItem('employees', JSON.stringify(employees));
            alert('Employee added!');
            window.location.href = 'employees.html';
        });
    }
}

// Display Employee List with Remove Button
function displayEmployees() {
    const employeeList = document.getElementById('employeeList');
    if (employeeList) {
        employeeList.innerHTML = employees.map((employee, index) => `
            <li>
                ${employee.name} - ${employee.role} - ₹${parseFloat(employee.salary).toFixed(2)} - ${employee.department} - ${employee.years} years
                <button onclick="removeEmployee(${index})">Remove</button>
            </li>
        `).join('');
    }
    
    // Employee Table (From the second part of the code)
    const employeeTableBody = document.querySelector("#employeeTable tbody");
    if (employeeTableBody) {
        updateEmployeeTable();
        updateTotalSalary();
    }
}

// Remove Employee Function
function removeEmployee(index) {
    employees.splice(index, 1);
    localStorage.setItem('employees', JSON.stringify(employees));
    window.location.reload();
}

// Update Employee Table (From the second part of the code)
function updateEmployeeTable() {
    const employeeTableBody = document.querySelector("#employeeTable tbody");
    if (employeeTableBody) {
        employeeTableBody.innerHTML = employees.map((employee, index) => `
            <tr>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>₹${parseFloat(employee.salary).toFixed(2)}</td>
                <td>${employee.startDate}</td>
                <td>${employee.years}</td>
                <td>${employee.department}</td>
                <td><button onclick="removeEmployee(${index})">Remove</button></td>
            </tr>
        `).join('');
    }
}

// Update Total Salary (From the second part of the code)
function updateTotalSalary() {
    const totalSalaryDiv = document.getElementById("totalSalary");
    if (totalSalaryDiv) {
        const totalSalary = employees.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0);
        totalSalaryDiv.textContent = `Total Salary: ₹${totalSalary.toFixed(2)}`;
    }
}

// Production - Add Production
function setupProductionForm() {
    const addProductionForm = document.getElementById('addProductionForm');
    if (addProductionForm) {
        addProductionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const productName = document.getElementById('productName').value;
            const productQuantity = document.getElementById('productQuantity').value;
            const productCost = document.getElementById('productCost').value;
            production.push({ 
                name: productName, 
                quantity: parseInt(productQuantity), 
                cost: parseFloat(productCost) 
            });
            localStorage.setItem('production', JSON.stringify(production));
            alert('Production added!');
            window.location.href = 'production.html';
        });
    }
}

// Display Production List with Remove Button
function displayProduction() {
    const productionList = document.getElementById('productionList');
    if (productionList) {
        productionList.innerHTML = production.map((item, index) => `
            <li>
                ${item.name} - ${item.quantity} units - ₹${parseFloat(item.cost).toFixed(2)} per unit
                <button onclick="removeProduction(${index})">Remove</button>
            </li>
        `).join('');
    }
}

// Remove Production Function
function removeProduction(index) {
    production.splice(index, 1);
    localStorage.setItem('production', JSON.stringify(production));
    window.location.reload();
}

// Reports - Calculate and Display Data
function generateReports() {
    if (document.getElementById('totalCost')) {
        document.getElementById('totalInventoryReport').textContent = inventory.length;
        document.getElementById('totalEmployeesReport').textContent = employees.length;
        document.getElementById('totalProductionReport').textContent = production.length;

        // Calculate Total Production Cost
        const totalCost = production.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)), 0);
        document.getElementById('totalCost').textContent = totalCost.toFixed(2);

        // Calculate Total Salary Cost
        const totalSalaryCost = employees.reduce((sum, employee) => sum + parseFloat(employee.salary || 0), 0);
        document.getElementById('totalSalaryCost').textContent = totalSalaryCost.toFixed(2);

        // Break-even Analysis
        const totalRevenue = production.reduce((sum, item) => sum + ((item.quantity || 0) * 100), 0); // Assuming ₹100 per unit revenue
        const breakEvenPoint = totalCost / 100; // Assuming ₹100 per unit revenue
        document.getElementById('breakEvenPointReport').textContent = `₹${breakEvenPoint.toFixed(2)} units`;

        // Risk Analysis
        const risk = totalRevenue - totalCost;
        document.getElementById('riskAnalysisReport').textContent = risk >= 0 ? `Profit: ₹${risk.toFixed(2)}` : `Loss: ₹${Math.abs(risk).toFixed(2)}`;

        // Calculate Variable Cost (VC), Fixed Cost (FC), Distribution Cost, and Other Manufacturing Costs
        const variableCost = totalCost * 0.6; // Assuming 60% of total cost is variable
        const fixedCost = totalCost * 0.3; // Assuming 30% of total cost is fixed
        const distributionCost = totalCost * 0.05; // Assuming 5% of total cost is distribution
        const otherManufacturingCost = totalCost * 0.05; // Assuming 5% of total cost is other manufacturing

        // Display Cost Breakdown
        document.getElementById('variableCost').textContent = `₹${variableCost.toFixed(2)}`;
        document.getElementById('fixedCost').textContent = `₹${fixedCost.toFixed(2)}`;
        document.getElementById('distributionCost').textContent = `₹${distributionCost.toFixed(2)}`;
        document.getElementById('otherManufacturingCost').textContent = `₹${otherManufacturingCost.toFixed(2)}`;

        // Calculate Number of Employees Needed for 100 pcs/day or 1000 pcs/day
        const productionPerEmployee = 10; // Assuming each employee can produce 10 units per day
        const employeesNeededFor100 = Math.ceil(100 / productionPerEmployee);
        const employeesNeededFor1000 = Math.ceil(1000 / productionPerEmployee);

        // Display Employees Needed
        document.getElementById('employeesNeeded').textContent = employeesNeededFor100;

        // Calculate and Display Projections
        calculateProjections();
    }
}

// Function to calculate projections
function calculateProjections() {
    if (!document.getElementById('productionYear1')) {
        return; // Don't proceed if the elements don't exist
    }

    const fixedCostsPerYear = 800000; // ₹8 lakhs per year
    const sellingPricePerUnit = 10; // ₹10 per unit
    const variableCostPerUnit = 7; // ₹7 per unit
    const profitPerUnit = sellingPricePerUnit - variableCostPerUnit; // ₹3 per unit

    // Production capacities
    const productionYear1 = 360000; // 1,000 units/day × 360 days = 3.6 lakh units/year
    const productionYear3 = 720000; // 2,000 units/day × 360 days = 7.2 lakh units/year
    const productionYear5 = 1800000; // 5,000 units/day × 360 days = 18 lakh units/year
    const productionYear10 = 3600000; // 10,000 units/day × 360 days = 36 lakh units/year

    // Calculate revenue, costs, and profit for each year
    const revenueYear1 = productionYear1 * sellingPricePerUnit;
    const variableCostYear1 = productionYear1 * variableCostPerUnit;
    const totalCostYear1 = variableCostYear1 + fixedCostsPerYear;
    const profitYear1 = revenueYear1 - totalCostYear1;

    const revenueYear3 = productionYear3 * sellingPricePerUnit;
    const variableCostYear3 = productionYear3 * variableCostPerUnit;
    const totalCostYear3 = variableCostYear3 + fixedCostsPerYear;
    const profitYear3 = revenueYear3 - totalCostYear3;

    const revenueYear5 = productionYear5 * sellingPricePerUnit;
    const variableCostYear5 = productionYear5 * variableCostPerUnit;
    const totalCostYear5 = variableCostYear5 + fixedCostsPerYear;
    const profitYear5 = revenueYear5 - totalCostYear5;

    const revenueYear10 = productionYear10 * sellingPricePerUnit;
    const variableCostYear10 = productionYear10 * variableCostPerUnit;
    const totalCostYear10 = variableCostYear10 + fixedCostsPerYear;
    const profitYear10 = revenueYear10 - totalCostYear10;

    // Display projections
    document.getElementById('productionYear1').textContent = productionYear1.toLocaleString();
    document.getElementById('revenueYear1').textContent = revenueYear1.toLocaleString();
    document.getElementById('profitYear1').textContent = profitYear1.toLocaleString();

    document.getElementById('productionYear3').textContent = productionYear3.toLocaleString();
    document.getElementById('revenueYear3').textContent = revenueYear3.toLocaleString();
    document.getElementById('profitYear3').textContent = profitYear3.toLocaleString();

    document.getElementById('productionYear5').textContent = productionYear5.toLocaleString();
    document.getElementById('revenueYear5').textContent = revenueYear5.toLocaleString();
    document.getElementById('profitYear5').textContent = profitYear5.toLocaleString();

    document.getElementById('productionYear10').textContent = productionYear10.toLocaleString();
    document.getElementById('revenueYear10').textContent = revenueYear10.toLocaleString();
    document.getElementById('profitYear10').textContent = profitYear10.toLocaleString();
}

// Initialize all components when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    employees = JSON.parse(localStorage.getItem('employees')) || [];
    production = JSON.parse(localStorage.getItem('production')) || [];
    
    // Initialize UI components
    updateDashboard();
    initializeCharts();
    setupInventoryForm();
    displayInventory();
    setupEmployeeForm();
    displayEmployees();
    setupProductionForm();
    displayProduction();
    generateReports();
});

// Make global functions available
window.removeEmployee = removeEmployee;
window.removeProduction = removeProduction;