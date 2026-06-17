// State Database Initialization
let state = {
    products: [],
    sales: [],
    expenses: [],
    purchases: [],
    categories: [],
    users: []
};

// Seed Mock Data if LocalStorage is empty
const SEED_DATA = {
    products: [
        { id: "p1", name: "Cute Bear Cotton Jumpsuit", sku: "LL-INF-101", category: "Infant Wear", size: "3-6M", costPrice: 250, sellingPrice: 699, stock: 15 },
        { id: "p2", name: "Dinosaur Printed Cotton Tee", sku: "LL-BOY-201", category: "Toddler Boys", size: "2-3Y", costPrice: 180, sellingPrice: 499, stock: 8 },
        { id: "p3", name: "Floral Pastel Summer Dress", sku: "LL-GIRL-301", category: "Toddler Girls", size: "4-5Y", costPrice: 320, sellingPrice: 899, stock: 12 },
        { id: "p4", name: "Soft Knit Crochet Booties", sku: "LL-ACC-401", category: "Kids Accessories", size: "One Size", costPrice: 80, sellingPrice: 299, stock: 25 },
        { id: "p5", name: "Ruffled Linen Pastel Romper", sku: "LL-GIRL-302", category: "Toddler Girls", size: "12-18M", costPrice: 280, sellingPrice: 799, stock: 3 }
    ],
    purchases: [
        { id: "pur1", dateTime: "2026-06-01T10:00:00.000Z", productId: "p1", productName: "Cute Bear Cotton Jumpsuit", sku: "LL-INF-101", size: "3-6M", qty: 20, costPrice: 250, supplier: "Primary Kids Factory Ltd", totalOutlay: 5000 },
        { id: "pur2", dateTime: "2026-06-01T11:30:00.000Z", productId: "p2", productName: "Dinosaur Printed Cotton Tee", sku: "LL-BOY-201", size: "2-3Y", qty: 15, costPrice: 180, supplier: "Nursery Textiles Corp", totalOutlay: 2700 },
        { id: "pur3", dateTime: "2026-06-02T14:15:00.000Z", productId: "p3", productName: "Floral Pastel Summer Dress", sku: "LL-GIRL-301", size: "4-5Y", qty: 15, costPrice: 320, supplier: "Nursery Textiles Corp", totalOutlay: 4800 },
        { id: "pur4", dateTime: "2026-06-03T09:00:00.000Z", productId: "p4", productName: "Soft Knit Crochet Booties", sku: "LL-ACC-401", size: "One Size", qty: 30, costPrice: 80, supplier: "Handcrafted Kids Ltd", totalOutlay: 2400 },
        { id: "pur5", dateTime: "2026-06-04T16:00:00.000Z", productId: "p5", productName: "Ruffled Linen Pastel Romper", sku: "LL-GIRL-302", size: "12-18M", qty: 10, costPrice: 280, supplier: "Primary Kids Factory Ltd", totalOutlay: 2800 }
    ],
    sales: [
        {
            id: "s1",
            invoiceNumber: "LAELA-1001",
            dateTime: "2026-06-10T12:30:00.000Z",
            customerName: "Ananya Sharma",
            items: [
                { productId: "p1", name: "Cute Bear Cotton Jumpsuit", sku: "LL-INF-101", size: "3-6M", quantity: 2, costPrice: 250, sellingPrice: 699 },
                { productId: "p2", name: "Dinosaur Printed Cotton Tee", sku: "LL-BOY-201", size: "2-3Y", quantity: 3, costPrice: 180, sellingPrice: 499 }
            ],
            subtotal: 2895,
            discountType: "percent",
            discountVal: 10,
            discountDeducted: 289.5,
            tax: 312.66,
            grandTotal: 2918.16,
            cogs: 1040,
            profit: 1565.5
        },
        {
            id: "s2",
            invoiceNumber: "LAELA-1002",
            dateTime: "2026-06-11T15:45:00.000Z",
            customerName: "Rahul Verma",
            items: [
                { productId: "p3", name: "Floral Pastel Summer Dress", sku: "LL-GIRL-301", size: "4-5Y", quantity: 1, costPrice: 320, sellingPrice: 899 },
                { productId: "p4", name: "Soft Knit Crochet Booties", sku: "LL-ACC-401", size: "One Size", quantity: 2, costPrice: 80, sellingPrice: 299 }
            ],
            subtotal: 1497,
            discountType: "flat",
            discountVal: 150,
            discountDeducted: 150,
            tax: 161.64,
            grandTotal: 1508.64,
            cogs: 480,
            profit: 867
        }
    ],
    expenses: [
        { id: "e1", date: "2026-06-02", amount: 1500, category: "Rent", notes: "June Rent for Shop Space" },
        { id: "e2", date: "2026-06-05", amount: 800, category: "Marketing", notes: "Instagram Kids Wear Ad Boost" },
        { id: "e3", date: "2026-06-08", amount: 350, category: "Packaging", notes: "Delivery cardboard box purchase (50 units)" }
    ],
    categories: ["Toddler Boys", "Toddler Girls", "Infant Wear", "Kids Accessories"],
    users: [
        { id: "u1", name: "Store Admin", username: "admin", password: "admin", role: "Admin", status: "Active" },
        { id: "u2", name: "Store Manager", username: "manager", password: "manager", role: "Manager", status: "Active" },
        { id: "u3", name: "Cashier Operator", username: "cashier", password: "cashier", role: "Cashier", status: "Active" }
    ]
};

// Database API + local storage fallback
const API_BASE = "/api";
let dbOnline = false;
let saveTimeout = null;

function normalizeStateShape(nextState) {
    if (!nextState.categories || nextState.categories.length === 0) {
        nextState.categories = ["Toddler Boys", "Toddler Girls", "Infant Wear", "Kids Accessories"];
    }
    if (!nextState.users || nextState.users.length === 0) {
        nextState.users = [
            { id: "u1", name: "Store Admin", username: "admin", password: "admin", role: "Admin", status: "Active" },
            { id: "u2", name: "Store Manager", username: "manager", password: "manager", role: "Manager", status: "Active" },
            { id: "u3", name: "Cashier Operator", username: "cashier", password: "cashier", role: "Cashier", status: "Active" }
        ];
    }
    return nextState;
}

function loadStateFromLocalStorage() {
    const raw = localStorage.getItem("laela_erp_state");
    if (raw) {
        try {
            state = normalizeStateShape(JSON.parse(raw));
            return;
        } catch (e) {
            console.error("Failed to parse local storage state, loading seed data.", e);
        }
    }
    state = { ...SEED_DATA };
}

async function loadState() {
    const localRaw = localStorage.getItem("laela_erp_state");
    let localState = null;
    if (localRaw) {
        try {
            localState = normalizeStateShape(JSON.parse(localRaw));
        } catch (e) {
            console.warn("Could not parse existing local storage state.", e);
        }
    }

    try {
        const response = await fetch(`${API_BASE}/state`);
        if (response.ok) {
            const apiState = normalizeStateShape(await response.json());
            dbOnline = true;

            const shouldMigrateLocalData = localState
                && !sessionStorage.getItem("laela_erp_db_migrated")
                && (localState.products.length > 0 || localState.sales.length > 0);

            if (shouldMigrateLocalData) {
                state = localState;
                await persistStateImmediate();
                sessionStorage.setItem("laela_erp_db_migrated", "true");
            } else {
                state = apiState;
            }

            saveStateToLocalStorage();
            updateDatabaseStatus();
            return;
        }
    } catch (e) {
        console.warn("Database API unavailable, using local storage.", e);
    }

    dbOnline = false;
    loadStateFromLocalStorage();
    updateDatabaseStatus();
}

function saveStateToLocalStorage() {
    localStorage.setItem("laela_erp_state", JSON.stringify(state));
}

async function persistStateImmediate() {
    saveStateToLocalStorage();

    if (!dbOnline) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/state`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state)
        });
        if (!response.ok) {
            throw new Error(`Save failed with status ${response.status}`);
        }
        return true;
    } catch (e) {
        console.error("Failed to save to database, data kept in local storage.", e);
        dbOnline = false;
        return false;
    }
}

async function persistState() {
    await persistStateImmediate();
}

function saveState() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        persistState();
    }, 250);
}

function updateDatabaseStatus() {
    const statusEl = document.getElementById("db-connection-status");
    if (!statusEl) return;

    if (dbOnline) {
        statusEl.innerHTML = '<span class="badge badge-success"><i class="fa-solid fa-database"></i> Connected to SQLite database</span>';
    } else {
        statusEl.innerHTML = '<span class="badge badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> Offline mode (browser storage only)</span>';
    }
}

// Router & Switching Tabs
let activeTab = "dashboard";
function switchTab(tabId) {
    // Role-based restrictions check
    const role = sessionStorage.getItem("laela_erp_active_role") || "Cashier";
    if (role === "Cashier" && (tabId === "dashboard" || tabId === "stock" || tabId === "expenses" || tabId === "reports" || tabId === "settings" || tabId === "users")) {
        alert("Access Denied: Cashier accounts do not have permission to view this panel.");
        return;
    }
    if (role === "Manager" && (tabId === "reports" || tabId === "settings" || tabId === "users")) {
        alert("Access Denied: Manager accounts do not have permission to view this panel.");
        return;
    }

    activeTab = tabId;
    
    // Toggle active menu class
    document.querySelectorAll(".menu-item").forEach(el => {
        el.classList.remove("active");
    });
    
    // Find active element and mark it
    const sidebarLinks = Array.from(document.querySelectorAll(".sidebar-menu li a"));
    sidebarLinks.forEach(link => {
        if (link.getAttribute("onclick").includes(`'${tabId}'`)) {
            link.classList.add("active");
        }
    });

    // Toggle viewport sections
    document.querySelectorAll(".tab-view").forEach(view => {
        view.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");

    // Title update
    const titles = {
        dashboard: "Dashboard Overview",
        stock: "Inventory & Stock Management",
        billing: "Billing & Point of Sale (POS)",
        expenses: "Store Operating Expenses",
        tags: "MRP Tag Barcode Generator",
        reports: "Financial Reports & Business Health",
        settings: "Settings & Database Management",
        users: "User Permissions & Roles Management"
    };
    document.getElementById("active-tab-title").innerText = titles[tabId];

    // Trigger tab-specific initialization
    if (tabId === "dashboard") {
        renderDashboard();
    } else if (tabId === "stock") {
        renderStockTable();
    } else if (tabId === "billing") {
        renderPOSProducts();
        updateCartTotals();
    } else if (tabId === "expenses") {
        renderExpenses();
        // set default date to today
        document.getElementById("expense-date").value = new Date().toISOString().substring(0, 10);
    } else if (tabId === "tags") {
        renderTagSelectorTable();
        updateLiveTagPreview();
    } else if (tabId === "reports") {
        initReportDates();
        runFinancialReports();
    } else if (tabId === "users") {
        renderUsersTable();
    }
}

// Format Currency
function fmtCurr(val) {
    return "₹" + parseFloat(val).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Charts references
let salesChartInst = null;
let stockChartInst = null;

// ==========================================
// 1. DASHBOARD VIEW LOGIC
// ==========================================
function renderDashboard() {
    // 1. Totals calculation
    let grossSales = 0;
    let totalCogs = 0;
    let taxCollected = 0;
    state.sales.forEach(s => {
        grossSales += s.grandTotal;
        totalCogs += s.cogs;
        taxCollected += s.tax;
    });

    // Revenue net of Tax
    const netRevenue = grossSales - taxCollected;

    let totalExpenses = 0;
    state.expenses.forEach(e => {
        totalExpenses += e.amount;
    });

    const netProfit = (netRevenue - totalCogs) - totalExpenses;
    
    // Valuation of remaining stock
    let totalStockValuation = 0;
    state.products.forEach(p => {
        totalStockValuation += (p.stock * p.costPrice);
    });

    // Write to DOM
    document.getElementById("dash-revenue").innerText = fmtCurr(grossSales);
    document.getElementById("dash-expenses").innerText = fmtCurr(totalExpenses);
    
    const profitEl = document.getElementById("dash-profit");
    profitEl.innerText = fmtCurr(netProfit);
    if (netProfit < 0) {
        profitEl.style.color = "var(--danger)";
    } else {
        profitEl.style.color = "var(--secondary)";
    }

    document.getElementById("dash-stock-value").innerText = fmtCurr(totalStockValuation);

    // 2. Load lists
    // Low stock warnings
    const lowStock = state.products.filter(p => p.stock < 5);
    document.getElementById("low-stock-count-badge").innerText = `${lowStock.length} items`;
    
    const lowStockTbody = document.getElementById("dash-low-stock-tbody");
    lowStockTbody.innerHTML = "";
    if (lowStock.length === 0) {
        lowStockTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">All items well stocked!</td></tr>`;
    } else {
        lowStock.forEach(p => {
            lowStockTbody.innerHTML += `
                <tr>
                    <td><code>${p.sku}</code></td>
                    <td>${p.name}</td>
                    <td><span class="badge badge-info">${p.size}</span></td>
                    <td><span class="badge badge-danger">${p.stock} units</span></td>
                </tr>
            `;
        });
    }

    // Recent Sales
    const recentSales = [...state.sales].sort((a,b) => new Date(b.dateTime) - new Date(a.dateTime)).slice(0, 5);
    const recentSalesTbody = document.getElementById("dash-recent-sales-tbody");
    recentSalesTbody.innerHTML = "";
    if (recentSales.length === 0) {
        recentSalesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No sales logged yet.</td></tr>`;
    } else {
        recentSales.forEach(s => {
            const dateStr = new Date(s.dateTime).toLocaleDateString('en-IN', {day:'numeric', month:'short'});
            const itemCount = s.items.reduce((sum, item) => sum + item.quantity, 0);
            recentSalesTbody.innerHTML += `
                <tr>
                    <td><strong>${s.invoiceNumber}</strong></td>
                    <td>${dateStr}</td>
                    <td>${itemCount} items</td>
                    <td style="font-weight:700; color:var(--primary);">${fmtCurr(s.grandTotal)}</td>
                </tr>
            `;
        });
    }

    // 3. Render Dashboard Charts
    renderDashboardCharts();
}

function renderDashboardCharts() {
    // Destroy existing charts to reload
    if (salesChartInst) salesChartInst.destroy();
    if (stockChartInst) stockChartInst.destroy();

    // Chart 1: Monthly Sales vs Purchases Outline
    // Group sales and purchases by months (Jan - Dec)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesData = Array(12).fill(0);
    const purchasesData = Array(12).fill(0);

    state.sales.forEach(s => {
        const date = new Date(s.dateTime);
        if (date.getFullYear() === 2026) {
            salesData[date.getMonth()] += s.grandTotal;
        }
    });

    state.purchases.forEach(p => {
        const date = new Date(p.dateTime);
        if (date.getFullYear() === 2026) {
            purchasesData[date.getMonth()] += p.totalOutlay;
        }
    });

    const ctxSales = document.getElementById("salesExpensesChart").getContext("2d");
    salesChartInst = new Chart(ctxSales, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Sales Revenue',
                    data: salesData,
                    backgroundColor: '#ff7e93',
                    borderRadius: 4
                },
                {
                    label: 'Stock Purchase Cost',
                    data: purchasesData,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f8fafc', font: { family: 'Outfit' } } }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    // Chart 2: Category Shares (Doughnut)
    const categoriesMap = {};
    state.products.forEach(p => {
        categoriesMap[p.category] = (categoriesMap[p.category] || 0) + p.stock;
    });

    const catLabels = Object.keys(categoriesMap);
    const catCounts = Object.values(categoriesMap);

    const ctxStock = document.getElementById("stockCategoriesChart").getContext("2d");
    stockChartInst = new Chart(ctxStock, {
        type: 'doughnut',
        data: {
            labels: catLabels.length > 0 ? catLabels : ["No stock"],
            datasets: [{
                data: catCounts.length > 0 ? catCounts : [1],
                backgroundColor: ['#2dd4bf', '#ff7e93', '#8b5cf6', '#f59e0b', '#ef4444'],
                borderWidth: 1,
                borderColor: '#151f32'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc', font: { family: 'Outfit', size: 11 } }
                }
            }
        }
    });
}

// ==========================================
// 2. STOCK MANAGER VIEW LOGIC
// ==========================================
function renderStockTable() {
    const q = document.getElementById("stock-search-input").value.toLowerCase();
    const catFilter = document.getElementById("stock-category-filter").value;
    const tbody = document.getElementById("stock-table-tbody");
    tbody.innerHTML = "";

    const filtered = state.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.size.toLowerCase().includes(q);
        const matchesCategory = catFilter === "" || p.category === catFilter;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 30px; color:var(--text-muted);">No products found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        let statusBadge = `<span class="badge badge-success">Good</span>`;
        if (p.stock === 0) {
            statusBadge = `<span class="badge badge-danger">Out of Stock</span>`;
        } else if (p.stock < 5) {
            statusBadge = `<span class="badge badge-warning">Low Stock</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><code>${p.sku}</code></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td><span class="badge badge-info">${p.size}</span></td>
                <td>${fmtCurr(p.costPrice)}</td>
                <td style="font-weight:600; color:var(--primary);">${fmtCurr(p.sellingPrice)}</td>
                <td style="font-weight:600;">${p.stock} units</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm btn-icon" onclick="openEditProductModal('${p.id}')" title="Edit Product">
                            <i class="fa-solid fa-pen" style="font-size:0.75rem;"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteProduct('${p.id}')" title="Delete Product">
                            <i class="fa-solid fa-trash" style="font-size:0.75rem;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddProductModal() {
    document.getElementById("product-modal-title").innerText = "Add New Kids Wear Item";
    document.getElementById("product-form").reset();
    document.getElementById("prod-id-field").value = "";
    document.getElementById("prod-sku").disabled = false;
    document.getElementById("prod-stock").disabled = false;
    document.getElementById("product-inward-log-note-group").style.display = "block";
    document.getElementById("product-modal").classList.add("active");
}

function openEditProductModal(id) {
    const p = state.products.find(item => item.id === id);
    if (!p) return;

    document.getElementById("product-modal-title").innerText = "Edit Product Details";
    document.getElementById("prod-id-field").value = p.id;
    document.getElementById("prod-name").value = p.name;
    document.getElementById("prod-sku").value = p.sku;
    document.getElementById("prod-sku").disabled = true; // SKU cannot be modified to avoid database mismatches
    document.getElementById("prod-category").value = p.category;
    document.getElementById("prod-size").value = p.size;
    document.getElementById("prod-stock").value = p.stock;
    document.getElementById("prod-stock").disabled = true; // Stock count must be adjusted via Inward Stock modal to preserve purchase logs
    document.getElementById("prod-cost").value = p.costPrice;
    document.getElementById("prod-price").value = p.sellingPrice;
    document.getElementById("product-inward-log-note-group").style.display = "none";
    document.getElementById("product-modal").classList.add("active");
}

function closeProductModal() {
    document.getElementById("product-modal").classList.remove("active");
}

function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById("prod-id-field").value;
    const name = document.getElementById("prod-name").value.trim();
    const sku = document.getElementById("prod-sku").value.trim().toUpperCase();
    const category = document.getElementById("prod-category").value;
    const size = document.getElementById("prod-size").value;
    const stock = parseInt(document.getElementById("prod-stock").value) || 0;
    const costPrice = parseFloat(document.getElementById("prod-cost").value) || 0;
    const sellingPrice = parseFloat(document.getElementById("prod-price").value) || 0;
    const supplier = document.getElementById("prod-supplier").value.trim() || "Initial stock load";

    if (costPrice > sellingPrice) {
        alert("Warning: Cost price is higher than Selling price/MRP!");
    }

    if (id === "") {
        // Add new
        // check duplicate SKU
        // check duplicate SKU with same cost price
        if (state.products.some(p => p.sku === sku && p.costPrice === costPrice)) {
            alert("Error: A product with this SKU code and cost price already exists!");
            return;
        }

        const newId = "p_" + Date.now();
        const newProduct = { id: newId, name, sku, category, size, costPrice, sellingPrice, stock };
        state.products.push(newProduct);

        // Generate stock inward log record for initial stock count
        if (stock > 0) {
            state.purchases.push({
                id: "pur_" + Date.now(),
                dateTime: new Date().toISOString(),
                productId: newId,
                productName: name,
                sku: sku,
                size: size,
                qty: stock,
                costPrice: costPrice,
                supplier: supplier,
                totalOutlay: stock * costPrice
            });
        }
    } else {
        // Edit existing
        const pIndex = state.products.findIndex(p => p.id === id);
        if (pIndex !== -1) {
            state.products[pIndex].name = name;
            state.products[pIndex].category = category;
            state.products[pIndex].size = size;
            state.products[pIndex].costPrice = costPrice;
            state.products[pIndex].sellingPrice = sellingPrice;
            // SKU and stock are locked in edit mode
        }
    }

    saveState();
    closeProductModal();
    renderStockTable();
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product? This may affect historical invoices referencing it.")) {
        state.products = state.products.filter(p => p.id !== id);
        saveState();
        renderStockTable();
    }
}

// Inward Stock Modal Operations
function openStockInwardModal() {
    const select = document.getElementById("inward-product-select");
    select.innerHTML = "";

    if (state.products.length === 0) {
        alert("Please create a product first before performing stock inward purchases!");
        return;
    }

    state.products.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.name} (${p.sku}) [Size: ${p.size}, Cost: ${fmtCurr(p.costPrice)}] - Stock: ${p.stock}</option>`;
    });

    document.getElementById("stock-inward-form").reset();
    
    // Auto populate unit cost from first product
    const firstProd = state.products[0];
    document.getElementById("inward-cost").value = firstProd.costPrice;
    
    select.onchange = function() {
        const prod = state.products.find(p => p.id === this.value);
        if (prod) {
            document.getElementById("inward-cost").value = prod.costPrice;
        }
    };

    document.getElementById("stock-inward-modal").classList.add("active");
}

function closeStockInwardModal() {
    document.getElementById("stock-inward-modal").classList.remove("active");
}

function saveStockInward(event) {
    event.preventDefault();
    const prodId = document.getElementById("inward-product-select").value;
    const qty = parseInt(document.getElementById("inward-qty").value) || 0;
    const costPrice = parseFloat(document.getElementById("inward-cost").value) || 0;
    const supplier = document.getElementById("inward-supplier").value.trim() || "Supplier Wholesale Market";

    const product = state.products.find(p => p.id === prodId);
    if (!product) return;

    // Check if there is already a product entry with the SAME SKU and the SAME costPrice
    let targetProduct = state.products.find(p => p.sku === product.sku && p.costPrice === costPrice);
    let targetProdId = prodId;

    if (targetProduct) {
        // Add to existing batch
        targetProduct.stock += qty;
        targetProdId = targetProduct.id;
    } else {
        // Create a new separate batch product entry
        const newId = "p_" + Date.now();
        targetProduct = {
            id: newId,
            name: product.name,
            sku: product.sku,
            category: product.category,
            size: product.size,
            costPrice: costPrice,
            sellingPrice: product.sellingPrice,
            stock: qty
        };
        state.products.push(targetProduct);
        targetProdId = newId;
    }

    // Log purchase/stock inward transaction
    state.purchases.push({
        id: "pur_" + Date.now(),
        dateTime: new Date().toISOString(),
        productId: targetProdId,
        productName: targetProduct.name,
        sku: targetProduct.sku,
        size: targetProduct.size,
        qty: qty,
        costPrice: costPrice,
        supplier: supplier,
        totalOutlay: qty * costPrice
    });

    saveState();
    closeStockInwardModal();
    renderStockTable();
    alert(`Successfully added ${qty} units to ${targetProduct.name} at cost ${fmtCurr(costPrice)}. Total stock for this batch is ${targetProduct.stock}.`);
}

// ==========================================
// 3. BILLING / POINT OF SALE (POS) LOGIC
// ==========================================
let posCart = [];
let activePOSCategory = "";

function filterPOSProducts(cat) {
    activePOSCategory = cat;
    document.querySelectorAll(".pos-cat-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText === cat || (cat === "" && btn.innerText === "All Products")) {
            btn.classList.add("active");
        }
    });
    renderPOSProducts();
}

function handlePOSSearch(event) {
    const q = event.target.value.trim().toLowerCase();
    
    // Check if the query is an exact match for a SKU (common for barcode scans)
    const exactSKUProduct = state.products.find(p => p.sku.toLowerCase() === q && p.stock > 0);
    if (exactSKUProduct) {
        addToPOSCart(exactSKUProduct.id);
        event.target.value = ""; // clear search
        return;
    }
    
    renderPOSProducts();
}

function renderPOSProducts() {
    const grid = document.getElementById("pos-products-grid");
    grid.innerHTML = "";

    const q = document.getElementById("pos-search-input").value.trim().toLowerCase();

    const filtered = state.products.filter(p => {
        const matchesCategory = activePOSCategory === "" || p.category === activePOSCategory;
        const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.size.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 40px; color:var(--text-muted);">No products in stock match the description.</div>`;
        return;
    }

    filtered.forEach(p => {
        const isOutOfStock = p.stock <= 0;
        grid.innerHTML += `
            <div class="pos-product-card" onclick="${isOutOfStock ? '' : `addToPOSCart('${p.id}')`}" style="${isOutOfStock ? 'opacity:0.5; cursor:not-allowed;' : ''}">
                <span class="pos-prod-size-badge">${p.size}</span>
                <div class="pos-prod-name">${p.name}</div>
                <div class="pos-prod-sku">${p.sku} <span style="font-size:0.75rem; color:var(--text-muted);">| Cost: ${fmtCurr(p.costPrice)}</span></div>
                <div class="pos-prod-footer">
                    <span class="pos-prod-price">${fmtCurr(p.sellingPrice)}</span>
                    <span class="pos-prod-stock" style="color: ${p.stock < 5 ? 'var(--danger)' : 'var(--text-secondary)'};">Stock: ${p.stock}</span>
                </div>
            </div>
        `;
    });
}

function addToPOSCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const cartItem = posCart.find(item => item.productId === productId);
    if (cartItem) {
        if (cartItem.quantity >= product.stock) {
            alert(`Cannot add more. Max available stock is ${product.stock} units.`);
            return;
        }
        cartItem.quantity += 1;
    } else {
        posCart.push({
            productId: product.id,
            name: product.name,
            sku: product.sku,
            size: product.size,
            quantity: 1,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice
        });
    }

    updateCartTotals();
}

function changeCartQty(productId, change) {
    const product = state.products.find(p => p.id === productId);
    const cartItem = posCart.find(item => item.productId === productId);
    if (!cartItem) return;

    const newQty = cartItem.quantity + change;
    if (newQty <= 0) {
        removeFromPOSCart(productId);
        return;
    }

    if (newQty > product.stock) {
        alert(`Cannot increase quantity. Max available stock is ${product.stock} units.`);
        return;
    }

    cartItem.quantity = newQty;
    updateCartTotals();
}

function removeFromPOSCart(productId) {
    posCart = posCart.filter(item => item.productId !== productId);
    updateCartTotals();
}

function clearPOSCart() {
    posCart = [];
    document.getElementById("pos-customer-name").value = "";
    document.getElementById("pos-discount-type").value = "none";
    document.getElementById("pos-discount-val").value = 0;
    updateCartTotals();
}

function updateCartTotals() {
    const container = document.getElementById("pos-cart-items-container");
    container.innerHTML = "";

    if (posCart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 0; color:var(--text-muted); font-size:0.9rem;">Cart is empty.<br>Click on items to add them here.</div>`;
        document.getElementById("cart-subtotal").innerText = "₹0.00";
        document.getElementById("cart-discount-deducted").innerText = "-₹0.00";
        document.getElementById("cart-tax").innerText = "₹0.00";
        document.getElementById("cart-grand-total").innerText = "₹0.00";
        return;
    }

    let subtotal = 0;
    posCart.forEach(item => {
        const itemTotal = item.sellingPrice * item.quantity;
        subtotal += itemTotal;

        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-meta">Size: ${item.size} | ${fmtCurr(item.sellingPrice)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeCartQty('${item.productId}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeCartQty('${item.productId}', 1)">+</button>
                </div>
                <div class="cart-item-price-col">
                    <span class="cart-item-total">${fmtCurr(itemTotal)}</span>
                </div>
                <button class="cart-item-remove" onclick="removeFromPOSCart('${item.productId}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    // Calc discount
    const discType = document.getElementById("pos-discount-type").value;
    const discVal = parseFloat(document.getElementById("pos-discount-val").value) || 0;
    let discountDeducted = 0;

    if (discType === "percent") {
        discountDeducted = subtotal * (discVal / 100);
    } else if (discType === "flat") {
        discountDeducted = discVal;
    }
    
    // Ensure discount does not exceed subtotal
    if (discountDeducted > subtotal) {
        discountDeducted = subtotal;
    }

    const netBeforeTax = subtotal - discountDeducted;
    
    // Dynamic GST Tax calculation
    const taxRate = parseFloat(document.getElementById("pos-tax-rate").value) || 0; 
    const tax = netBeforeTax * taxRate;
    const grandTotal = netBeforeTax + tax;

    document.getElementById("cart-subtotal").innerText = fmtCurr(subtotal);
    document.getElementById("cart-discount-deducted").innerText = `-${fmtCurr(discountDeducted)}`;
    document.getElementById("cart-tax").innerText = fmtCurr(tax);
    document.getElementById("cart-grand-total").innerText = fmtCurr(grandTotal);
}

function processPOSCheckout() {
    if (posCart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // 1. Double check stocks
    for (let item of posCart) {
        const product = state.products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            alert(`Error: Product "${item.name}" has insufficient stock. Only ${product ? product.stock : 0} units left.`);
            return;
        }
    }

    // 2. Reduce stock inventory
    posCart.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        product.stock -= item.quantity;
    });

    // 3. Compute costs and profits
    let subtotal = 0;
    let cogs = 0;
    posCart.forEach(item => {
        subtotal += item.sellingPrice * item.quantity;
        cogs += item.costPrice * item.quantity;
    });

    const discType = document.getElementById("pos-discount-type").value;
    const discVal = parseFloat(document.getElementById("pos-discount-val").value) || 0;
    let discountDeducted = 0;

    if (discType === "percent") {
        discountDeducted = subtotal * (discVal / 100);
    } else if (discType === "flat") {
        discountDeducted = discVal;
    }
    if (discountDeducted > subtotal) discountDeducted = subtotal;

    const netBeforeTax = subtotal - discountDeducted;
    const taxRate = parseFloat(document.getElementById("pos-tax-rate").value) || 0;
    const tax = netBeforeTax * taxRate;
    const grandTotal = netBeforeTax + tax;
    
    // Net profit on this transaction = Revenue (grandTotal - tax) - COGS
    const profit = netBeforeTax - cogs;

    const invoiceNum = "LAELA-" + (1000 + state.sales.length + 1);
    const newSale = {
        id: "sale_" + Date.now(),
        invoiceNumber: invoiceNum,
        dateTime: new Date().toISOString(),
        customerName: document.getElementById("pos-customer-name").value.trim() || "Walk-in Customer",
        items: [...posCart],
        subtotal,
        discountType: discType,
        discountVal: discVal,
        discountDeducted,
        taxRate,
        tax,
        grandTotal,
        cogs,
        profit
    };

    state.sales.push(newSale);
    saveState();

    // 4. Render Invoice Printable Receipt
    renderInvoiceReceipt(newSale);

    // 5. Open printable modal
    document.getElementById("receipt-modal").classList.add("active");

    // 6. Reset POS Cart
    clearPOSCart();
    renderPOSProducts();
}

function renderInvoiceReceipt(sale) {
    const card = document.getElementById("printable-receipt-card");
    const dateStr = new Date(sale.dateTime).toLocaleString('en-IN');
    
    let itemsHTML = "";
    sale.items.forEach(item => {
        const itemTotal = item.sellingPrice * item.quantity;
        itemsHTML += `
            <tr>
                <td colspan="3">${item.name} (${item.size})</td>
            </tr>
            <tr>
                <td style="padding-left:10px;">${item.quantity} x ${fmtCurr(item.sellingPrice)}</td>
                <td style="text-align:right;">${fmtCurr(itemTotal)}</td>
            </tr>
        `;
    });

    card.innerHTML = `
        <div class="invoice-header">
            <h2>LAELA KIDS WEAR</h2>
            <p>Premium Kids wear & Accessories Store</p>
            <p>Phase 5, DLF Phase 3, Gurugram</p>
            <p>Phone: +91 9876543210</p>
        </div>
        <div class="invoice-details">
            <div><strong>Invoice:</strong> ${sale.invoiceNumber}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>Customer:</strong> ${sale.customerName}</div>
        </div>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th style="width:70%;">Description</th>
                    <th style="text-align:right; width:30%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        <div class="invoice-summary">
            <div class="invoice-summary-row">
                <span>Subtotal:</span>
                <span>${fmtCurr(sale.subtotal)}</span>
            </div>
            ${sale.discountDeducted > 0 ? `
            <div class="invoice-summary-row">
                <span>Discount:</span>
                <span>-${fmtCurr(sale.discountDeducted)}</span>
            </div>` : ''}
            <div class="invoice-summary-row">
                <span>GST / Tax (${sale.taxRate !== undefined ? (sale.taxRate * 100).toFixed(0) : "12"}%):</span>
                <span>${fmtCurr(sale.tax)}</span>
            </div>
            <div class="invoice-summary-row bold">
                <span>Grand Total:</span>
                <span>${fmtCurr(sale.grandTotal)}</span>
            </div>
        </div>
        <div class="invoice-header" style="margin-top: 15px;">
            <svg id="receipt-barcode"></svg>
        </div>
        <div class="invoice-footer">
            <p>Thank you for shopping at LaeLa!</p>
            <p>Exchange policy: Within 7 days with tag intact.</p>
        </div>
    `;

    // Render receipt barcode using JsBarcode
    setTimeout(() => {
        JsBarcode("#receipt-barcode", sale.invoiceNumber, {
            format: "CODE128",
            width: 1.5,
            height: 35,
            displayValue: true,
            fontSize: 10,
            background: "#ffffff",
            lineColor: "#000000"
        });
    }, 50);
}

function closeReceiptModal() {
    document.getElementById("receipt-modal").classList.remove("active");
}

// ==========================================
// 4. EXPENSES TRACKER LOGIC
// ==========================================
function renderExpenses() {
    const tbody = document.getElementById("expenses-table-tbody");
    tbody.innerHTML = "";

    const sorted = [...state.expenses].sort((a,b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No expenses recorded.</td></tr>`;
        return;
    }

    sorted.forEach(e => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(e.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</td>
                <td><span class="badge badge-warning">${e.category}</span></td>
                <td>${e.notes || '—'}</td>
                <td style="font-weight:700; color:var(--danger);">${fmtCurr(e.amount)}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteExpense('${e.id}')" title="Delete Log">
                        <i class="fa-solid fa-trash" style="font-size:0.75rem;"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function saveExpense(event) {
    event.preventDefault();
    const date = document.getElementById("expense-date").value;
    const amount = parseFloat(document.getElementById("expense-amount").value) || 0;
    const category = document.getElementById("expense-category").value;
    const notes = document.getElementById("expense-notes").value.trim();

    const newExpense = {
        id: "exp_" + Date.now(),
        date,
        amount,
        category,
        notes
    };

    state.expenses.push(newExpense);
    saveState();
    
    // reset form
    document.getElementById("expense-form").reset();
    document.getElementById("expense-date").value = new Date().toISOString().substring(0, 10);
    
    renderExpenses();
    alert("Expense logged successfully!");
}

function deleteExpense(id) {
    if (confirm("Delete this expense entry?")) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        renderExpenses();
    }
}

// ==========================================
// 5. MRP TAG GENERATOR LOGIC
// ==========================================
function renderTagSelectorTable() {
    const tbody = document.getElementById("tag-products-selection-tbody");
    tbody.innerHTML = "";

    if (state.products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No products in stock to generate tags.</td></tr>`;
        return;
    }

    state.products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><input type="checkbox" class="tag-row-checkbox" value="${p.id}" onchange="updateLiveTagPreview()"></td>
                <td><strong>${p.name}</strong></td>
                <td><code>${p.sku}</code></td>
                <td><span class="badge badge-info">${p.size}</span></td>
                <td>${fmtCurr(p.sellingPrice)}</td>
                <td><input type="number" class="form-control tag-qty-input" id="tag-qty-${p.id}" value="5" min="1" style="width:70px; padding:4px 8px;"></td>
            </tr>
        `;
    });
}

function toggleSelectAllTags(masterCheckbox) {
    document.querySelectorAll(".tag-row-checkbox").forEach(cb => {
        cb.checked = masterCheckbox.checked;
    });
    updateLiveTagPreview();
}

function updateLiveTagPreview() {
    const storeName = document.getElementById("tag-store-name").value;
    const storePhone = document.getElementById("tag-store-phone").value;
    const showStore = document.getElementById("tag-show-store").checked;
    const showSKU = document.getElementById("tag-show-sku").checked;
    const showSize = document.getElementById("tag-show-size").checked;
    const showBarcode = document.getElementById("tag-show-barcode").checked;

    // Grab first checked product for preview, or default to first stock item
    let sampleProd = state.products[0];
    const checkedCheckbox = document.querySelector(".tag-row-checkbox:checked");
    if (checkedCheckbox) {
        const found = state.products.find(p => p.id === checkedCheckbox.value);
        if (found) sampleProd = found;
    }

    if (!sampleProd) {
        document.getElementById("live-tag-preview-card").style.display = "none";
        return;
    }
    
    document.getElementById("live-tag-preview-card").style.display = "flex";

    // Setup text fields
    document.getElementById("preview-store-name").innerText = storeName;
    document.getElementById("preview-store-name").style.display = showStore ? "block" : "none";
    document.getElementById("preview-store-phone").innerText = storePhone;
    document.getElementById("preview-store-phone").style.display = showStore ? "block" : "none";

    document.getElementById("preview-prod-name").innerText = sampleProd.name;
    document.getElementById("preview-sku").innerText = `SKU: ${sampleProd.sku}`;
    document.getElementById("preview-sku").style.display = showSKU ? "inline" : "none";

    document.getElementById("preview-size").innerText = `Size: ${sampleProd.size}`;
    document.getElementById("preview-size").style.display = showSize ? "inline" : "none";

    document.getElementById("preview-mrp").innerText = `MRP: ${fmtCurr(sampleProd.sellingPrice)}`;
    
    const barcodeSvg = document.getElementById("preview-barcode-svg");
    if (showBarcode) {
        barcodeSvg.style.display = "block";
        try {
            JsBarcode("#preview-barcode-svg", sampleProd.sku, {
                format: "CODE128",
                width: 1.5,
                height: 30,
                displayValue: false,
                margin: 0
            });
        } catch (e) {
            console.error("Barcode generation error", e);
        }
    } else {
        barcodeSvg.style.display = "none";
    }
}

function printStickerSheet() {
    const storeName = document.getElementById("tag-store-name").value;
    const storePhone = document.getElementById("tag-store-phone").value;
    const showStore = document.getElementById("tag-show-store").checked;
    const showSKU = document.getElementById("tag-show-sku").checked;
    const showSize = document.getElementById("tag-show-size").checked;
    const showBarcode = document.getElementById("tag-show-barcode").checked;
    const columns = document.getElementById("tag-columns").value;

    const checkedItems = document.querySelectorAll(".tag-row-checkbox:checked");
    if (checkedItems.length === 0) {
        alert("Please select at least one product checkbox to print tags.");
        return;
    }

    const printContainer = document.getElementById("print-stickers-container");
    printContainer.innerHTML = "";
    
    // Set grid columns class
    printContainer.className = "";
    printContainer.classList.add(`print-stickers-grid-${columns}`);

    let stickerCount = 0;
    checkedItems.forEach(cb => {
        const prodId = cb.value;
        const product = state.products.find(p => p.id === prodId);
        if (!product) return;

        const qtyInput = document.getElementById(`tag-qty-${prodId}`);
        const count = parseInt(qtyInput.value) || 1;

        for (let i = 0; i < count; i++) {
            stickerCount++;
            const stickerId = `sticker-${product.id}-${i}`;
            printContainer.innerHTML += `
                <div class="print-mrp-tag">
                    ${showStore ? `<div class="mrp-tag-store">${storeName}</div>` : ''}
                    <div class="mrp-tag-title">${product.name}</div>
                    <div class="mrp-tag-row">
                        ${showSKU ? `<span>SKU: ${product.sku}</span>` : ''}
                        ${showSize ? `<span>Size: ${product.size}</span>` : ''}
                    </div>
                    <div class="mrp-tag-mrp">MRP: ${fmtCurr(product.sellingPrice)}</div>
                    ${showBarcode ? `<svg id="${stickerId}"></svg>` : ''}
                    ${showStore ? `<div style="font-size:0.55rem; color:#666; margin-top:2px;">${storePhone}</div>` : ''}
                </div>
            `;
        }
    });

    // Render barcodes for all tags sequentially
    setTimeout(() => {
        checkedItems.forEach(cb => {
            const prodId = cb.value;
            const product = state.products.find(p => p.id === prodId);
            if (!product) return;

            const qtyInput = document.getElementById(`tag-qty-${prodId}`);
            const count = parseInt(qtyInput.value) || 1;

            if (showBarcode) {
                for (let i = 0; i < count; i++) {
                    const stickerId = `sticker-${product.id}-${i}`;
                    try {
                        JsBarcode(`#${stickerId}`, product.sku, {
                            format: "CODE128",
                            width: 1.2,
                            height: 25,
                            displayValue: false,
                            margin: 2
                        });
                    } catch (e) {
                        console.error("Failed printing sticker barcode", e);
                    }
                }
            }
        });

        // Trigger native print flow
        window.print();
    }, 150);
}

// ==========================================
// 6. REPORTS PANEL VIEW LOGIC
// ==========================================
let activeReportTab = "stockstatus";

function switchReportTab(reportName) {
    activeReportTab = reportName;
    document.querySelectorAll(".report-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    // Add active to targeted button
    const btns = Array.from(document.querySelectorAll(".reports-tabs button"));
    btns.forEach(btn => {
        if (btn.getAttribute("onclick").includes(`'${reportName}'`)) {
            btn.classList.add("active");
        }
    });

    document.querySelectorAll(".report-table-section").forEach(sec => {
        sec.classList.remove("active");
    });
    document.getElementById(`report-${reportName}-section`).classList.add("active");
}

function initReportDates() {
    const preset = document.getElementById("report-date-preset").value;
    if (preset === "custom") {
        document.getElementById("report-custom-start-group").style.display = "block";
        document.getElementById("report-custom-end-group").style.display = "block";
    } else {
        document.getElementById("report-custom-start-group").style.display = "none";
        document.getElementById("report-custom-end-group").style.display = "none";
    }
}

function handlePresetDateChange() {
    initReportDates();
    runFinancialReports();
}

// Date Range Filter Logic
function getFilteredRange() {
    const preset = document.getElementById("report-date-preset").value;
    let start = new Date();
    let end = new Date();

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    if (preset === "today") {
        // start and end are today
    } else if (preset === "yesterday") {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        end.setHours(23,59,59,999);
    } else if (preset === "last7") {
        start.setDate(start.getDate() - 6);
    } else if (preset === "thismonth") {
        start = new Date(start.getFullYear(), start.getMonth(), 1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (preset === "custom") {
        const startInput = document.getElementById("report-start-date").value;
        const endInput = document.getElementById("report-end-date").value;
        if (startInput) start = new Date(startInput + "T00:00:00");
        if (endInput) end = new Date(endInput + "T23:59:59");
    }

    return { start, end };
}

function runFinancialReports() {
    const range = getFilteredRange();
    
    // 1. Filter Sales
    const filteredSales = state.sales.filter(s => {
        const tDate = new Date(s.dateTime);
        return tDate >= range.start && tDate <= range.end;
    });

    // 2. Filter Purchases
    const filteredPurchases = state.purchases.filter(p => {
        const pDate = new Date(p.dateTime);
        return pDate >= range.start && pDate <= range.end;
    });

    // 3. Filter Expenses
    const filteredExpenses = state.expenses.filter(e => {
        const eDate = new Date(e.date + "T12:00:00"); // midday comparison
        return eDate >= range.start && eDate <= range.end;
    });

    // Compute Metrics
    let grossRevenue = 0; // grand total
    let taxCollected = 0;
    let totalCogs = 0;

    filteredSales.forEach(s => {
        grossRevenue += s.grandTotal;
        taxCollected += s.tax;
        totalCogs += s.cogs;
    });

    // Revenue net of tax
    const netRevenue = grossRevenue - taxCollected;
    const grossProfit = netRevenue - totalCogs;

    let totalExpenses = 0;
    filteredExpenses.forEach(e => {
        totalExpenses += e.amount;
    });

    const netProfit = grossProfit - totalExpenses;
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // Display KPIs
    document.getElementById("report-gross-sales").innerText = fmtCurr(grossRevenue);
    document.getElementById("report-cogs").innerText = fmtCurr(totalCogs);
    
    const grossProfitEl = document.getElementById("report-gross-profit");
    grossProfitEl.innerText = fmtCurr(grossProfit);
    grossProfitEl.className = "val " + (grossProfit < 0 ? "negative" : "positive");

    document.getElementById("report-operating-expenses").innerText = fmtCurr(totalExpenses);

    const netProfitEl = document.getElementById("report-net-profit");
    netProfitEl.innerText = fmtCurr(netProfit);
    netProfitEl.className = "val " + (netProfit < 0 ? "negative" : "positive");

    const marginEl = document.getElementById("report-profit-margin");
    marginEl.innerText = profitMargin.toFixed(1) + "%";
    marginEl.className = "val " + (profitMargin < 0 ? "negative" : "positive");

    // RENDER SUB-TAB TABLES
    renderReportSalesTable(filteredSales);
    renderReportPurchasesTable(filteredPurchases);
    renderReportMarginsTable(filteredSales);
    renderReportStockStatusTable();
}

function renderReportSalesTable(filteredSales) {
    const tbody = document.getElementById("report-sales-tbody");
    tbody.innerHTML = "";

    if (filteredSales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:30px; color:var(--text-muted);">No sales records for selected dates.</td></tr>`;
        return;
    }

    filteredSales.forEach(s => {
        const timeStr = new Date(s.dateTime).toLocaleString('en-IN', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.invoiceNumber}</strong></td>
                <td>${timeStr}</td>
                <td>${s.customerName}</td>
                <td><span class="badge badge-info">${s.items.length} items</span></td>
                <td>${fmtCurr(s.subtotal)}</td>
                <td>-${fmtCurr(s.discountDeducted)}</td>
                <td>${fmtCurr(s.tax)}</td>
                <td style="font-weight:700; color:var(--primary);">${fmtCurr(s.grandTotal)}</td>
                <td>${fmtCurr(s.cogs)}</td>
                <td style="font-weight:700; color:var(--secondary);">${fmtCurr(s.profit)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="reprintReceiptFromReport('${s.id}')">
                        <i class="fa-solid fa-print"></i> Receipt
                    </button>
                </td>
            </tr>
        `;
    });
}

function renderReportPurchasesTable(filteredPurchases) {
    const tbody = document.getElementById("report-purchases-tbody");
    tbody.innerHTML = "";

    if (filteredPurchases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">No stock purchase history for selected dates.</td></tr>`;
        return;
    }

    filteredPurchases.forEach(p => {
        const timeStr = new Date(p.dateTime).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
        tbody.innerHTML += `
            <tr>
                <td>${timeStr}</td>
                <td><code>${p.sku}</code></td>
                <td><strong>${p.productName}</strong></td>
                <td><span class="badge badge-info">${p.size}</span></td>
                <td style="font-weight:600;">+${p.qty} units</td>
                <td>${fmtCurr(p.costPrice)}</td>
                <td>${fmtCurr(p.costPrice * 1.5 /* Approximate MRP */)}</td>
                <td><span style="font-size:0.8rem; color:var(--text-secondary);">${p.supplier}</span></td>
                <td style="font-weight:700; color:var(--accent);">${fmtCurr(p.totalOutlay)}</td>
            </tr>
        `;
    });
}

function renderReportMarginsTable(filteredSales) {
    const tbody = document.getElementById("report-margins-tbody");
    tbody.innerHTML = "";

    // Aggregate statistics by product ID based on filtered sales list
    const productStats = {};
    
    // Seed all products from inventory to show comprehensive catalog profitability
    state.products.forEach(p => {
        productStats[p.id] = {
            sku: p.sku,
            name: p.name,
            category: p.category,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            soldCount: 0,
            revenue: 0,
            cogs: 0,
            grossProfit: 0
        };
    });

    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            // Check if product exists in stats
            if (!productStats[item.productId]) {
                productStats[item.productId] = {
                    sku: item.sku,
                    name: item.name,
                    category: "Archived",
                    costPrice: item.costPrice,
                    sellingPrice: item.sellingPrice,
                    soldCount: 0,
                    revenue: 0,
                    cogs: 0,
                    grossProfit: 0
                };
            }
            const stat = productStats[item.productId];
            stat.soldCount += item.quantity;
            stat.revenue += item.sellingPrice * item.quantity;
            stat.cogs += item.costPrice * item.quantity;
            stat.grossProfit = stat.revenue - stat.cogs;
        });
    });

    const statsArray = Object.values(productStats).sort((a,b) => b.grossProfit - a.grossProfit);

    statsArray.forEach(st => {
        const marginPct = st.revenue > 0 ? (st.grossProfit / st.revenue) * 100 : 0;
        tbody.innerHTML += `
            <tr>
                <td><code>${st.sku}</code></td>
                <td><strong>${st.name}</strong></td>
                <td>${st.category}</td>
                <td>${fmtCurr(st.costPrice)}</td>
                <td>${fmtCurr(st.sellingPrice)}</td>
                <td style="font-weight:600;">${st.soldCount} sold</td>
                <td style="font-weight:600; color:var(--primary);">${fmtCurr(st.revenue)}</td>
                <td>${fmtCurr(st.cogs)}</td>
                <td style="font-weight:700; color:var(--secondary);">${fmtCurr(st.grossProfit)}</td>
                <td>
                    <span class="badge ${marginPct > 45 ? 'badge-success' : 'badge-info'}" style="font-weight:700;">
                        ${marginPct.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `;
    });
}

function renderReportStockStatusTable() {
    const tbody = document.getElementById("report-stockstatus-tbody");
    tbody.innerHTML = "";

    if (state.products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">No products in inventory.</td></tr>`;
        return;
    }

    state.products.forEach(p => {
        const totalCost = p.stock * p.costPrice;
        const totalMRP = p.stock * p.sellingPrice;
        
        let statusBadge = `<span class="badge badge-success">Good</span>`;
        if (p.stock === 0) {
            statusBadge = `<span class="badge badge-danger">Out of Stock</span>`;
        } else if (p.stock < 5) {
            statusBadge = `<span class="badge badge-warning">Low Stock</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><code>${p.sku}</code></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td><span class="badge badge-info">${p.size}</span></td>
                <td style="font-weight:600;">${p.stock} units</td>
                <td>${fmtCurr(p.costPrice)}</td>
                <td>${fmtCurr(p.sellingPrice)}</td>
                <td>${fmtCurr(totalCost)}</td>
                <td style="font-weight:700; color:var(--primary);">${fmtCurr(totalMRP)}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
}

function reprintReceiptFromReport(saleId) {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;

    renderInvoiceReceipt(sale);
    document.getElementById("receipt-modal").classList.add("active");
}

// CSV Export Utilities
function exportCSVReport(type) {
    const range = getFilteredRange();
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `Report_${type}_${range.start.toISOString().substring(0, 10)}.csv`;

    if (type === 'sales') {
        const filteredSales = state.sales.filter(s => {
            const tDate = new Date(s.dateTime);
            return tDate >= range.start && tDate <= range.end;
        });

        csvContent += "Invoice Number,Date & Time,Customer Name,Items Count,Subtotal,Discount Deducted,GST Tax,Grand Total,COGS,Net Profit\n";
        filteredSales.forEach(s => {
            const dateStr = new Date(s.dateTime).toLocaleString('en-IN').replace(/,/g, '');
            csvContent += `${s.invoiceNumber},${dateStr},"${s.customerName}",${s.items.length},${s.subtotal},${s.discountDeducted},${s.tax},${s.grandTotal},${s.cogs},${s.profit}\n`;
        });
    } 
    else if (type === 'purchases') {
        const filteredPurchases = state.purchases.filter(p => {
            const pDate = new Date(p.dateTime);
            return pDate >= range.start && pDate <= range.end;
        });

        csvContent += "Date,SKU,Product Name,Size,Quantity Added,Unit Cost Price,Total Expenditure,Supplier\n";
        filteredPurchases.forEach(p => {
            const dateStr = new Date(p.dateTime).toLocaleDateString('en-IN');
            csvContent += `${dateStr},${p.sku},"${p.productName}",${p.size},${p.qty},${p.costPrice},${p.totalOutlay},"${p.supplier}"\n`;
        });
    } 
    else if (type === 'margins') {
        const filteredSales = state.sales.filter(s => {
            const tDate = new Date(s.dateTime);
            return tDate >= range.start && tDate <= range.end;
        });

        csvContent += "SKU,Product Name,Category,Cost Price,MRP Price,Sold Count,Revenue,COGS,Gross Profit,Margin Percent\n";

        // Aggregate margins
        const productStats = {};
        state.products.forEach(p => {
            productStats[p.id] = { sku: p.sku, name: p.name, category: p.category, costPrice: p.costPrice, sellingPrice: p.sellingPrice, soldCount: 0, revenue: 0, cogs: 0 };
        });

        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productStats[item.productId]) {
                    productStats[item.productId] = { sku: item.sku, name: item.name, category: "Archived", costPrice: item.costPrice, sellingPrice: item.sellingPrice, soldCount: 0, revenue: 0, cogs: 0 };
                }
                const stat = productStats[item.productId];
                stat.soldCount += item.quantity;
                stat.revenue += item.sellingPrice * item.quantity;
                stat.cogs += item.costPrice * item.quantity;
            });
        });

        Object.values(productStats).forEach(st => {
            const grossProfit = st.revenue - st.cogs;
            const marginPct = st.revenue > 0 ? (grossProfit / st.revenue) * 100 : 0;
            csvContent += `${st.sku},"${st.name}",${st.category},${st.costPrice},${st.sellingPrice},${st.soldCount},${st.revenue},${st.cogs},${grossProfit},${marginPct.toFixed(1)}%\n`;
        });
    }
    else if (type === 'stockstatus') {
        csvContent += "SKU,Product Name,Category,Size,Quantity in Stock,Unit Cost Price,Unit MRP Price,Total Cost Valuation,Total MRP Valuation,Status\n";
        state.products.forEach(p => {
            const totalCost = p.stock * p.costPrice;
            const totalMRP = p.stock * p.sellingPrice;
            let status = "Good";
            if (p.stock === 0) status = "Out of Stock";
            else if (p.stock < 5) status = "Low Stock";

            csvContent += `${p.sku},"${p.name}",${p.category},${p.size},${p.stock},${p.costPrice},${p.sellingPrice},${totalCost},${totalMRP},${status}\n`;
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// BACKUP / RESTORE UTILITIES
// ==========================================
function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `laela_erp_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function triggerImport() {
    document.getElementById("import-file-input").click();
}

function importBackup(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        try {
            const parsed = JSON.parse(reader.result);
            if (parsed.products && parsed.sales && parsed.expenses && parsed.purchases) {
                state = parsed;
                saveState();
                alert("ERP Database successfully restored from backup!");
                switchTab(activeTab); // reload active tab
            } else {
                alert("Invalid backup file structure. Ensure it is a valid LaeLa ERP file.");
            }
        } catch (e) {
            alert("Error parsing backup JSON file. Make sure file is not corrupted.");
        }
    };
    reader.readAsText(file);
    input.value = ""; // clear inputs
}

// ==========================================
// DYNAMIC CATEGORY MANAGEMENT UTILITIES
// ==========================================
function populateCategoryDropdowns() {
    // 1. Stock Category Filter in Stock Manager
    const stockCatFilter = document.getElementById("stock-category-filter");
    if (stockCatFilter) {
        const selected = stockCatFilter.value;
        stockCatFilter.innerHTML = '<option value="">All Categories</option>';
        state.categories.forEach(cat => {
            stockCatFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        stockCatFilter.value = selected;
    }

    // 2. Add/Edit Product category select
    const prodCategory = document.getElementById("prod-category");
    if (prodCategory) {
        const selected = prodCategory.value;
        prodCategory.innerHTML = '';
        state.categories.forEach(cat => {
            prodCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        if (selected && state.categories.includes(selected)) {
            prodCategory.value = selected;
        }
    }

    // 3. POS category pills
    const posCatContainer = document.getElementById("pos-category-container");
    if (posCatContainer) {
        posCatContainer.innerHTML = `<button class="pos-cat-btn ${activePOSCategory === '' ? 'active' : ''}" onclick="filterPOSProducts('')">All Products</button>`;
        state.categories.forEach(cat => {
            posCatContainer.innerHTML += `<button class="pos-cat-btn ${activePOSCategory === cat ? 'active' : ''}" onclick="filterPOSProducts('${cat}')">${cat}</button>`;
        });
    }
}

function openCategoriesModal() {
    renderCategoriesList();
    document.getElementById("category-form").reset();
    document.getElementById("categories-modal").classList.add("active");
}

function closeCategoriesModal() {
    document.getElementById("categories-modal").classList.remove("active");
    populateCategoryDropdowns();
}

function renderCategoriesList() {
    const tbody = document.getElementById("categories-list-tbody");
    tbody.innerHTML = "";

    state.categories.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${cat}</strong></td>
                <td style="text-align: right;">
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCategory('${cat.replace(/'/g, "\\'")}')" title="Delete Category">
                        <i class="fa-solid fa-trash" style="font-size:0.75rem;"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function saveCategory(event) {
    event.preventDefault();
    const catName = document.getElementById("new-category-name").value.trim();
    if (catName === "") return;

    // Check duplicate
    if (state.categories.some(cat => cat.toLowerCase() === catName.toLowerCase())) {
        alert("Error: Category already exists!");
        return;
    }

    state.categories.push(catName);
    saveState();
    
    document.getElementById("category-form").reset();
    renderCategoriesList();
    populateCategoryDropdowns();
}

function deleteCategory(catName) {
    // Check if category contains active products
    const inUse = state.products.some(p => p.category.toLowerCase() === catName.toLowerCase());
    if (inUse) {
        alert(`Cannot delete category "${catName}". It is currently referenced by products in stock!`);
        return;
    }

    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
        state.categories = state.categories.filter(cat => cat !== catName);
        saveState();
        renderCategoriesList();
        populateCategoryDropdowns();
    }
}

async function resetERPDatabase() {
    if (!confirm("WARNING: Are you sure you want to reset the entire database? This will permanently delete all stock inventory, transactions, expenses, and categories. This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reset`, { method: "POST" });
        if (response.ok) {
            state = normalizeStateShape(await response.json());
            saveStateToLocalStorage();
            dbOnline = true;
            alert("Database reset to defaults. The page will now reload.");
            window.location.reload();
            return;
        }
    } catch (e) {
        console.warn("Database reset API unavailable, clearing local storage only.", e);
    }

    localStorage.removeItem("laela_erp_state");
    alert("Database wiped. The page will now reload to initialize the system.");
    window.location.reload();
}

// ==========================================
// USER LOGIN & SECURITY SESSIONS
// ==========================================
function checkLoginState() {
    const loggedIn = sessionStorage.getItem("laela_erp_logged_in");
    const appContainer = document.querySelector(".app-container");
    const loginContainer = document.getElementById("login-container");

    if (loggedIn === "true") {
        appContainer.style.display = "flex";
        loginContainer.style.display = "none";

        // Dynamically adjust sidebar based on user role
        const role = sessionStorage.getItem("laela_erp_active_role") || "Cashier";
        const fullName = sessionStorage.getItem("laela_erp_active_fullname") || "Store Admin";
        
        // Update user badge in sidebar footer
        const footerUserBadge = document.querySelector(".sidebar-footer div div");
        if (footerUserBadge) {
            footerUserBadge.innerHTML = `
                <strong>${fullName}</strong>
                <div style="font-size: 0.75rem;">${role}</div>
            `;
        }

        // Show/hide menu items based on role permissions
        const menuDashboard = document.getElementById("menu-dashboard");
        const menuStock = document.getElementById("menu-stock");
        const menuBilling = document.getElementById("menu-billing");
        const menuExpenses = document.getElementById("menu-expenses");
        const menuTags = document.getElementById("menu-tags");
        const menuReports = document.getElementById("menu-reports");
        const menuSettings = document.getElementById("menu-settings");
        const menuUsers = document.getElementById("menu-users");

        if (menuDashboard) menuDashboard.parentElement.style.display = (role === "Admin" || role === "Manager") ? "block" : "none";
        if (menuStock) menuStock.parentElement.style.display = (role === "Admin" || role === "Manager") ? "block" : "none";
        if (menuBilling) menuBilling.parentElement.style.display = "block"; // Always visible
        if (menuExpenses) menuExpenses.parentElement.style.display = (role === "Admin" || role === "Manager") ? "block" : "none";
        if (menuTags) menuTags.parentElement.style.display = "block"; // Always visible
        if (menuReports) menuReports.parentElement.style.display = (role === "Admin") ? "block" : "none";
        if (menuSettings) menuSettings.parentElement.style.display = (role === "Admin") ? "block" : "none";
        if (menuUsers) menuUsers.parentElement.style.display = (role === "Admin") ? "block" : "none";

    } else {
        appContainer.style.display = "none";
        loginContainer.style.display = "flex";
        
        // Hide login error on clean loads
        const errorMsg = document.getElementById("login-error-msg");
        if (errorMsg) errorMsg.style.display = "none";
    }
}

function handleERPLogin(event) {
    event.preventDefault();
    const u = document.getElementById("login-username").value.trim();
    const p = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error-msg");

    // Scan state.users for valid matching active credentials
    const user = state.users.find(user => user.username === u && user.password === p);
    if (user) {
        if (user.status !== "Active") {
            errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Account is inactive!';
            errorMsg.style.display = "block";
            return;
        }
        errorMsg.style.display = "none";
        sessionStorage.setItem("laela_erp_logged_in", "true");
        sessionStorage.setItem("laela_erp_active_user", user.username);
        sessionStorage.setItem("laela_erp_active_fullname", user.name);
        sessionStorage.setItem("laela_erp_active_role", user.role);
        
        checkLoginState();
        
        // Redirect depending on user role
        if (user.role === "Cashier") {
            switchTab("billing");
        } else {
            switchTab("dashboard");
        }
        
        document.getElementById("login-form").reset();
    } else {
        errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Invalid username or password!';
        errorMsg.style.display = "block";
    }
}

function handleERPLogout() {
    if (confirm("Are you sure you want to lock the ERP terminal and logout?")) {
        sessionStorage.removeItem("laela_erp_logged_in");
        sessionStorage.removeItem("laela_erp_active_user");
        sessionStorage.removeItem("laela_erp_active_fullname");
        sessionStorage.removeItem("laela_erp_active_role");
        checkLoginState();
    }
}

// ==========================================
// USER CREATION & MANAGEMENT CRUD
// ==========================================
function renderUsersTable() {
    const q = document.getElementById("users-search-input").value.toLowerCase().trim();
    const tbody = document.getElementById("users-table-tbody");
    tbody.innerHTML = "";

    const filtered = state.users.filter(u => {
        return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:var(--text-muted);">No users found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(u => {
        let roleBadge = `<span class="badge badge-info">${u.role}</span>`;
        if (u.role === "Admin") {
            roleBadge = `<span class="badge badge-danger">${u.role}</span>`;
        } else if (u.role === "Manager") {
            roleBadge = `<span class="badge badge-warning">${u.role}</span>`;
        }

        const statusBadge = u.status === "Active" 
            ? `<span class="badge badge-success">${u.status}</span>` 
            : `<span class="badge badge-secondary">${u.status}</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td><code>${u.username}</code></td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm btn-icon" onclick="openEditUserModal('${u.id}')" title="Edit User">
                            <i class="fa-solid fa-user-pen" style="font-size:0.75rem;"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteUser('${u.id}')" title="Delete User">
                            <i class="fa-solid fa-user-minus" style="font-size:0.75rem;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddUserModal() {
    document.getElementById("user-modal-title").innerText = "Create New ERP User";
    document.getElementById("user-form").reset();
    document.getElementById("user-id-field").value = "";
    document.getElementById("user-username").disabled = false;
    document.getElementById("user-password").required = true;
    document.getElementById("user-password").placeholder = "Enter password";
    document.getElementById("user-modal").classList.add("active");
}

function openEditUserModal(id) {
    const u = state.users.find(user => user.id === id);
    if (!u) return;

    document.getElementById("user-modal-title").innerText = "Edit User Details";
    document.getElementById("user-id-field").value = u.id;
    document.getElementById("user-fullname").value = u.name;
    document.getElementById("user-username").value = u.username;
    document.getElementById("user-username").disabled = true; // Username cannot be changed
    document.getElementById("user-password").value = u.password;
    document.getElementById("user-password").required = true;
    document.getElementById("user-role").value = u.role;
    document.getElementById("user-status").value = u.status;
    document.getElementById("user-modal").classList.add("active");
}

function closeUserModal() {
    document.getElementById("user-modal").classList.remove("active");
}

function saveUser(event) {
    event.preventDefault();
    const id = document.getElementById("user-id-field").value;
    const name = document.getElementById("user-fullname").value.trim();
    const username = document.getElementById("user-username").value.trim().toLowerCase();
    const password = document.getElementById("user-password").value;
    const role = document.getElementById("user-role").value;
    const status = document.getElementById("user-status").value;

    const currentActiveUsername = sessionStorage.getItem("laela_erp_active_user");

    // Self-modification protection checks if editing
    if (id !== "") {
        const editingUser = state.users.find(u => u.id === id);
        if (editingUser && editingUser.username === currentActiveUsername) {
            // Check status deactivation
            if (status !== "Active") {
                alert("Error: You cannot deactivate your own active session!");
                return;
            }
            // Check role demotion
            if (editingUser.role === "Admin" && role !== "Admin") {
                alert("Error: You cannot demote your own user role! Another Admin must perform this action.");
                return;
            }
        }
    }

    if (id === "") {
        // Add User
        // Check duplicate username
        if (state.users.some(u => u.username === username)) {
            alert("Error: A user with this username already exists!");
            return;
        }

        const newId = "u_" + Date.now();
        state.users.push({
            id: newId,
            name,
            username,
            password,
            role,
            status
        });
    } else {
        // Edit User
        const index = state.users.findIndex(u => u.id === id);
        if (index !== -1) {
            // Update details
            state.users[index].name = name;
            state.users[index].password = password;
            state.users[index].role = role;
            state.users[index].status = status;

            // If updating currently logged-in user, refresh their session variables
            if (state.users[index].username === currentActiveUsername) {
                sessionStorage.setItem("laela_erp_active_fullname", name);
                sessionStorage.setItem("laela_erp_active_role", role);
                checkLoginState();
            }
        }
    }

    saveState();
    closeUserModal();
    renderUsersTable();
}

function deleteUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    const currentActiveUsername = sessionStorage.getItem("laela_erp_active_user");

    // Protection check
    if (user.username === currentActiveUsername) {
        alert("Error: You cannot delete your own active user account!");
        return;
    }

    if (confirm(`Are you sure you want to delete user "${user.name}" (${user.username})?`)) {
        state.users = state.users.filter(u => u.id !== id);
        saveState();
        renderUsersTable();
    }
}

// ==========================================
// APPLICATION LAUNCH AND INIT
// ==========================================
window.onload = async function() {
    // Write current date
    const today = new Date();
    document.getElementById("current-date").innerText = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load from SQLite API (falls back to local storage)
    await loadState();

    // Check Login Session
    checkLoginState();

    // Populate category dropdowns
    populateCategoryDropdowns();

    // Only navigate to a protected tab after login
    const loggedIn = sessionStorage.getItem("laela_erp_logged_in") === "true";
    if (loggedIn) {
        // Start with Dashboard (role checks apply inside switchTab)
        switchTab("dashboard");
    }
};
