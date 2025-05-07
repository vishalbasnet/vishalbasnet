function generateReport() {
    let price = parseFloat(document.getElementById("priceInput").value);
    if (isNaN(price) || price <= 0) {
        alert("Enter a valid price.");
        return;
    }
    
    let projections = [
        { year: 1, margin: 0.035 },
        { year: 3, margin: 0.09 },
        { year: 5, margin: 0.13 },
        { year: 10, margin: 0.18 }
    ];
    
    let revenue = projections.map(p => price * 1000 * 365 * p.year);
    let profit = projections.map((p, i) => revenue[i] * p.margin);
    
    // Bar Chart
    let ctx1 = document.getElementById("barChart").getContext("2d");
    new Chart(ctx1, {
        type: "bar",
        data: {
            labels: projections.map(p => `Year ${p.year}`),
            datasets: [{
                label: "Revenue (₹)",
                data: revenue,
                backgroundColor: "blue"
            }, {
                label: "Profit (₹)",
                data: profit,
                backgroundColor: "green"
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
    
    // Pie Chart
    let ctx2 = document.getElementById("pieChart").getContext("2d");
    new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Fixed Costs", "Variable Costs", "Profit"],
            datasets: [{
                data: [40, 40, 20],
                backgroundColor: ["red", "yellow", "green"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Wave Chart (Line Chart)
    let ctx3 = document.getElementById("wavechart").getContext("2d");
    new Chart(ctx3, {
        type: "line",
        data: {
            labels: projections.map(p => `Year ${p.year}`),
            datasets: [{
                label: "Revenue Wave (₹)",
                data: revenue,
                borderColor: "blue",
                fill: false
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