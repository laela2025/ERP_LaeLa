export const SEED_DATA = {
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
        { id: "e1", date: "2026-06-02", amount: 1500, category: "Rent", description: "June Rent for Shop Space", paymentMode: "Bank Transfer", remarks: "Paid to landlord" },
        { id: "e2", date: "2026-06-05", amount: 800, category: "Marketing", description: "Instagram Kids Wear Ad Boost", paymentMode: "UPI", remarks: "" },
        { id: "e3", date: "2026-06-08", amount: 350, category: "Packaging", description: "Delivery cardboard box purchase (50 units)", paymentMode: "Cash", remarks: "Local supplier" }
    ],
    categories: ["Toddler Boys", "Toddler Girls", "Infant Wear", "Kids Accessories"],
    expenseCategories: ["Rent", "Salaries", "Utilities", "Marketing", "Packaging", "Repairs", "Other"],
    users: [
        { id: "u1", name: "Store Admin", username: "admin", password: "admin", role: "Admin", status: "Active" },
        { id: "u2", name: "Store Manager", username: "manager", password: "manager", role: "Manager", status: "Active" },
        { id: "u3", name: "Cashier Operator", username: "cashier", password: "cashier", role: "Cashier", status: "Active" }
    ]
};
