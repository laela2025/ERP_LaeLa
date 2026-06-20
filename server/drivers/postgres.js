import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SEED_DATA } from "../seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const dataDir = path.join(__dirname, "..", "..", "data");
const backupsDir = path.join(dataDir, "backups");

function buildPoolConfig() {
    if (process.env.DATABASE_URL) {
        return { connectionString: process.env.DATABASE_URL };
    }
    return {
        host: process.env.PG_HOST || "localhost",
        port: Number(process.env.PG_PORT || 5432),
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE || "laela_erp",
        ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined
    };
}

const poolConfig = buildPoolConfig();
export const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":****@")
    : `postgresql://${poolConfig.user}@${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`;

let pool;

async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT NOT NULL,
            category TEXT NOT NULL,
            size TEXT NOT NULL,
            cost_price DOUBLE PRECISION NOT NULL,
            selling_price DOUBLE PRECISION NOT NULL,
            stock INTEGER NOT NULL,
            UNIQUE (sku, cost_price)
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
            amount DOUBLE PRECISION NOT NULL,
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
            cost_price DOUBLE PRECISION NOT NULL,
            selling_price DOUBLE PRECISION,
            bill_number TEXT,
            supplier TEXT NOT NULL,
            total_outlay DOUBLE PRECISION NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL,
            date_time TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            subtotal DOUBLE PRECISION NOT NULL,
            discount_type TEXT NOT NULL,
            discount_val DOUBLE PRECISION NOT NULL,
            discount_deducted DOUBLE PRECISION NOT NULL,
            tax DOUBLE PRECISION NOT NULL,
            grand_total DOUBLE PRECISION NOT NULL,
            cogs DOUBLE PRECISION NOT NULL,
            profit DOUBLE PRECISION NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id SERIAL PRIMARY KEY,
            sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            sku TEXT NOT NULL,
            size TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            cost_price DOUBLE PRECISION NOT NULL,
            selling_price DOUBLE PRECISION NOT NULL
        );
    `);
}

async function ensureSchemaCompatibility() {
    const { rows } = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'bill_number'
    `);
    if (rows.length === 0) {
        await pool.query("ALTER TABLE purchases ADD COLUMN bill_number TEXT");
    }

    const { rows: sellingPriceCol } = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'selling_price'
    `);
    if (sellingPriceCol.length === 0) {
        await pool.query("ALTER TABLE purchases ADD COLUMN selling_price DOUBLE PRECISION");
    }

    // Older DBs had UNIQUE(sku) — blocks same SKU at different purchase costs (stock batches)
    await pool.query("ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key");

    const { rows: batchUnique } = await pool.query(`
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'products'
          AND con.conname = 'products_sku_cost_price_key'
    `);
    if (batchUnique.length === 0) {
        try {
            await pool.query("ALTER TABLE products ADD CONSTRAINT products_sku_cost_price_key UNIQUE (sku, cost_price)");
        } catch (error) {
            console.warn("Could not add products_sku_cost_price_key:", error.message);
        }
    }
}

async function needsSeedData() {
    const { rows } = await pool.query(`
        SELECT
            (SELECT COUNT(*)::int FROM products)  AS "productsCount",
            (SELECT COUNT(*)::int FROM categories) AS "categoriesCount",
            (SELECT COUNT(*)::int FROM users)     AS "usersCount",
            (SELECT COUNT(*)::int FROM expenses)  AS "expensesCount",
            (SELECT COUNT(*)::int FROM purchases) AS "purchasesCount",
            (SELECT COUNT(*)::int FROM sales)     AS "salesCount",
            (SELECT COUNT(*)::int FROM sale_items) AS "saleItemsCount"
    `);
    const counts = rows[0];
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

export async function initDatabase() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    pool = new Pool(poolConfig);
    await pool.query("SELECT 1");
    await initSchema();
    await ensureSchemaCompatibility();

    if (await needsSeedData()) {
        await saveState(SEED_DATA);
    }
}

export async function closeDatabase() {
    await pool?.end();
}

export async function saveState(state, { updateUsers = true } = {}) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM sale_items");
        await client.query("DELETE FROM sales");
        await client.query("DELETE FROM purchases");
        await client.query("DELETE FROM expenses");
        await client.query("DELETE FROM products");
        await client.query("DELETE FROM categories");
        if (updateUsers) {
            await client.query("DELETE FROM users");
        }

        for (const product of state.products || []) {
            await client.query(
                `INSERT INTO products (id, name, sku, category, size, cost_price, selling_price, stock)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [product.id, product.name, product.sku, product.category, product.size, product.costPrice, product.sellingPrice, product.stock]
            );
        }

        for (const category of state.categories || []) {
            await client.query("INSERT INTO categories (name) VALUES ($1)", [category]);
        }

        if (updateUsers) {
            for (const user of state.users || []) {
                await client.query(
                    `INSERT INTO users (id, name, username, password, role, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [user.id, user.name, user.username, user.password, user.role, user.status]
                );
            }
        }

        for (const expense of state.expenses || []) {
            await client.query(
                `INSERT INTO expenses (id, date, amount, category, notes)
                 VALUES ($1, $2, $3, $4, $5)`,
                [expense.id, expense.date, expense.amount, expense.category, expense.notes ?? null]
            );
        }

        for (const purchase of state.purchases || []) {
            await client.query(
                `INSERT INTO purchases (id, date_time, product_id, product_name, sku, size, qty, cost_price, selling_price, bill_number, supplier, total_outlay)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [purchase.id, purchase.dateTime, purchase.productId, purchase.productName, purchase.sku, purchase.size, purchase.qty, purchase.costPrice, purchase.sellingPrice ?? null, purchase.billNumber ?? null, purchase.supplier, purchase.totalOutlay]
            );
        }

        for (const sale of state.sales || []) {
            const { items, ...saleRow } = sale;
            await client.query(
                `INSERT INTO sales (id, invoice_number, date_time, customer_name, subtotal, discount_type, discount_val, discount_deducted, tax, grand_total, cogs, profit)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [saleRow.id, saleRow.invoiceNumber, saleRow.dateTime, saleRow.customerName, saleRow.subtotal, saleRow.discountType, saleRow.discountVal, saleRow.discountDeducted, saleRow.tax, saleRow.grandTotal, saleRow.cogs, saleRow.profit]
            );
            for (const item of items || []) {
                await client.query(
                    `INSERT INTO sale_items (sale_id, product_id, name, sku, size, quantity, cost_price, selling_price)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [sale.id, item.productId, item.name, item.sku, item.size, item.quantity, item.costPrice, item.sellingPrice]
                );
            }
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function loadState() {
    const productsResult = await pool.query(`
        SELECT id, name, sku, category, size, cost_price AS "costPrice", selling_price AS "sellingPrice", stock
        FROM products
        ORDER BY name
    `);

    const categoriesResult = await pool.query("SELECT name FROM categories ORDER BY name");
    const usersResult = await pool.query(`
        SELECT id, name, username, password, role, status
        FROM users
        ORDER BY name
    `);
    const expensesResult = await pool.query(`
        SELECT id, date, amount, category, notes
        FROM expenses
        ORDER BY date DESC
    `);
    const purchasesResult = await pool.query(`
        SELECT
            id,
            date_time AS "dateTime",
            product_id AS "productId",
            product_name AS "productName",
            sku,
            size,
            qty,
            cost_price AS "costPrice",
            selling_price AS "sellingPrice",
            bill_number AS "billNumber",
            supplier,
            total_outlay AS "totalOutlay"
        FROM purchases
        ORDER BY date_time DESC
    `);
    const salesResult = await pool.query(`
        SELECT
            id,
            invoice_number AS "invoiceNumber",
            date_time AS "dateTime",
            customer_name AS "customerName",
            subtotal,
            discount_type AS "discountType",
            discount_val AS "discountVal",
            discount_deducted AS "discountDeducted",
            tax,
            grand_total AS "grandTotal",
            cogs,
            profit
        FROM sales
        ORDER BY date_time DESC
    `);
    const saleItemsResult = await pool.query(`
        SELECT
            sale_id AS "saleId",
            product_id AS "productId",
            name,
            sku,
            size,
            quantity,
            cost_price AS "costPrice",
            selling_price AS "sellingPrice"
        FROM sale_items
    `);

    const itemsBySale = new Map();
    for (const item of saleItemsResult.rows) {
        const { saleId, ...rest } = item;
        if (!itemsBySale.has(saleId)) {
            itemsBySale.set(saleId, []);
        }
        itemsBySale.get(saleId).push(rest);
    }

    const sales = salesResult.rows.map((sale) => ({
        ...sale,
        items: itemsBySale.get(sale.id) || []
    }));

    return {
        products: productsResult.rows,
        sales,
        expenses: expensesResult.rows,
        purchases: purchasesResult.rows,
        categories: categoriesResult.rows.map((row) => row.name),
        users: usersResult.rows
    };
}

export async function resetDatabase() {
    const usersResult = await pool.query(`
        SELECT id, name, username, password, role, status
        FROM users
        ORDER BY name
    `);

    await saveState({
        products: [],
        sales: [],
        expenses: [],
        purchases: [],
        categories: [],
        users: usersResult.rows
    });
    return loadState();
}

export async function createDatabaseBackupFile(prefix = "laela_erp_backup") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${prefix}_${timestamp}.json`;
    const backupPath = path.join(backupsDir, filename);
    const state = await loadState();
    fs.writeFileSync(backupPath, JSON.stringify(state, null, 2), "utf8");
    return backupPath;
}
