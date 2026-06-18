import { DatabaseSync, backup } from "node:sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SEED_DATA } from "./seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Database location:
// - Default: ./data/laela_erp.db (can be versioned in git via Git LFS)
// - Override: set LAELA_ERP_DB_PATH to an absolute path outside the repo
//
// Live data safety: run `npm run db:protect` so git pull/push of code never
// overwrites or commits your real ERP data. See README.md.
const envDbPath = process.env.LAELA_ERP_DB_PATH && process.env.LAELA_ERP_DB_PATH.trim();
const dataDir = envDbPath ? path.dirname(envDbPath) : path.join(__dirname, "..", "data");
const dbPath = envDbPath || path.join(dataDir, "laela_erp.db");
const backupsDir = path.join(dataDir, "backups");

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

function runInTransaction(fn) {
    db.exec("BEGIN");
    try {
        fn();
        db.exec("COMMIT");
    } catch (error) {
        db.exec("ROLLBACK");
        throw error;
    }
}

function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            size TEXT NOT NULL,
            cost_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            stock INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS categories (
            name TEXT PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS purchases (
            id TEXT PRIMARY KEY,
            date_time TEXT NOT NULL,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            sku TEXT NOT NULL,
            size TEXT NOT NULL,
            qty INTEGER NOT NULL,
            cost_price REAL NOT NULL,
            bill_number TEXT,
            supplier TEXT NOT NULL,
            total_outlay REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL,
            date_time TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            subtotal REAL NOT NULL,
            discount_type TEXT NOT NULL,
            discount_val REAL NOT NULL,
            discount_deducted REAL NOT NULL,
            tax REAL NOT NULL,
            grand_total REAL NOT NULL,
            cogs REAL NOT NULL,
            profit REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            sku TEXT NOT NULL,
            size TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            cost_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
        );
    `);
}

function ensureSchemaCompatibility() {
    // Add purchases.bill_number for existing databases created before this field existed.
    try {
        const cols = db.prepare("PRAGMA table_info(purchases)").all().map((c) => c.name);
        if (!cols.includes("bill_number")) {
            db.exec("ALTER TABLE purchases ADD COLUMN bill_number TEXT");
        }
    } catch (e) {
        // If anything goes wrong, we keep running; the app will still work without bill numbers persisted.
        console.warn("Schema compatibility check failed:", e);
    }
}

function needsSeedData() {
    const counts = db.prepare(`
        SELECT
            (SELECT COUNT(*) FROM products)  AS productsCount,
            (SELECT COUNT(*) FROM categories) AS categoriesCount,
            (SELECT COUNT(*) FROM users)     AS usersCount,
            (SELECT COUNT(*) FROM expenses)  AS expensesCount,
            (SELECT COUNT(*) FROM purchases) AS purchasesCount,
            (SELECT COUNT(*) FROM sales)     AS salesCount,
            (SELECT COUNT(*) FROM sale_items) AS saleItemsCount
    `).get();

    // Only seed when the database is truly new/empty.
    return (
        counts.productsCount === 0
        && counts.categoriesCount === 0
        && counts.usersCount === 0
        && counts.expensesCount === 0
        && counts.purchasesCount === 0
        && counts.salesCount === 0
        && counts.saleItemsCount === 0
    );
}

function saveState(state) {
    runInTransaction(() => {
        db.prepare("DELETE FROM sale_items").run();
        db.prepare("DELETE FROM sales").run();
        db.prepare("DELETE FROM purchases").run();
        db.prepare("DELETE FROM expenses").run();
        db.prepare("DELETE FROM products").run();
        db.prepare("DELETE FROM categories").run();
        db.prepare("DELETE FROM users").run();

        const insertProduct = db.prepare(`
            INSERT INTO products (id, name, sku, category, size, cost_price, selling_price, stock)
            VALUES (@id, @name, @sku, @category, @size, @costPrice, @sellingPrice, @stock)
        `);
        for (const product of state.products || []) {
            insertProduct.run(product);
        }

        const insertCategory = db.prepare("INSERT INTO categories (name) VALUES (?)");
        for (const category of state.categories || []) {
            insertCategory.run(category);
        }

        const insertUser = db.prepare(`
            INSERT INTO users (id, name, username, password, role, status)
            VALUES (@id, @name, @username, @password, @role, @status)
        `);
        for (const user of state.users || []) {
            insertUser.run(user);
        }

        const insertExpense = db.prepare(`
            INSERT INTO expenses (id, date, amount, category, notes)
            VALUES (@id, @date, @amount, @category, @notes)
        `);
        for (const expense of state.expenses || []) {
            insertExpense.run(expense);
        }

        const insertPurchase = db.prepare(`
            INSERT INTO purchases (id, date_time, product_id, product_name, sku, size, qty, cost_price, bill_number, supplier, total_outlay)
            VALUES (@id, @dateTime, @productId, @productName, @sku, @size, @qty, @costPrice, @billNumber, @supplier, @totalOutlay)
        `);
        for (const purchase of state.purchases || []) {
            insertPurchase.run(purchase);
        }

        const insertSale = db.prepare(`
            INSERT INTO sales (id, invoice_number, date_time, customer_name, subtotal, discount_type, discount_val, discount_deducted, tax, grand_total, cogs, profit)
            VALUES (@id, @invoiceNumber, @dateTime, @customerName, @subtotal, @discountType, @discountVal, @discountDeducted, @tax, @grandTotal, @cogs, @profit)
        `);
        const insertSaleItem = db.prepare(`
            INSERT INTO sale_items (sale_id, product_id, name, sku, size, quantity, cost_price, selling_price)
            VALUES (@saleId, @productId, @name, @sku, @size, @quantity, @costPrice, @sellingPrice)
        `);
        for (const sale of state.sales || []) {
            const { items, ...saleRow } = sale;
            insertSale.run(saleRow);
            for (const item of items || []) {
                insertSaleItem.run({ saleId: sale.id, ...item });
            }
        }
    });
}

function loadState() {
    const products = db.prepare(`
        SELECT id, name, sku, category, size, cost_price AS costPrice, selling_price AS sellingPrice, stock
        FROM products
        ORDER BY name
    `).all();

    const categories = db.prepare("SELECT name FROM categories ORDER BY name").all().map((row) => row.name);

    const users = db.prepare(`
        SELECT id, name, username, password, role, status
        FROM users
        ORDER BY name
    `).all();

    const expenses = db.prepare(`
        SELECT id, date, amount, category, notes
        FROM expenses
        ORDER BY date DESC
    `).all();

    const purchases = db.prepare(`
        SELECT
            id,
            date_time AS dateTime,
            product_id AS productId,
            product_name AS productName,
            sku,
            size,
            qty,
            cost_price AS costPrice,
            bill_number AS billNumber,
            supplier,
            total_outlay AS totalOutlay
        FROM purchases
        ORDER BY date_time DESC
    `).all();

    const salesRows = db.prepare(`
        SELECT
            id,
            invoice_number AS invoiceNumber,
            date_time AS dateTime,
            customer_name AS customerName,
            subtotal,
            discount_type AS discountType,
            discount_val AS discountVal,
            discount_deducted AS discountDeducted,
            tax,
            grand_total AS grandTotal,
            cogs,
            profit
        FROM sales
        ORDER BY date_time DESC
    `).all();

    const saleItems = db.prepare(`
        SELECT
            sale_id AS saleId,
            product_id AS productId,
            name,
            sku,
            size,
            quantity,
            cost_price AS costPrice,
            selling_price AS sellingPrice
        FROM sale_items
    `).all();

    const itemsBySale = new Map();
    for (const item of saleItems) {
        const { saleId, ...rest } = item;
        if (!itemsBySale.has(saleId)) {
            itemsBySale.set(saleId, []);
        }
        itemsBySale.get(saleId).push(rest);
    }

    const sales = salesRows.map((sale) => ({
        ...sale,
        items: itemsBySale.get(sale.id) || []
    }));

    return {
        products,
        sales,
        expenses,
        purchases,
        categories,
        users
    };
}

function resetDatabase() {
    const users = db.prepare(`
        SELECT id, name, username, password, role, status
        FROM users
        ORDER BY name
    `).all();

    saveState({
        products: [],
        sales: [],
        expenses: [],
        purchases: [],
        categories: [],
        users
    });
    return loadState();
}

initSchema();
ensureSchemaCompatibility();

if (needsSeedData()) {
    saveState(SEED_DATA);
}

export { db, dbPath, loadState, saveState, resetDatabase };

export async function createDatabaseBackupFile(prefix = "laela_erp_backup") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${prefix}_${timestamp}.db`;
    const backupPath = path.join(backupsDir, filename);

    // Online backup via Node's built-in sqlite module (works in WAL mode).
    await backup(db, backupPath);
    return backupPath;
}
