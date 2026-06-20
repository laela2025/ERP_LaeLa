import * as postgres from "./drivers/postgres.js";

export const dbEngine = "postgres";
export let dbPath = "";

function assertPostgresEnv() {
    if (!process.env.DATABASE_URL && !process.env.PG_HOST) {
        throw new Error(
            "PostgreSQL is required. Set DATABASE_URL or PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, and PG_DATABASE in .env"
        );
    }
}

export async function initDatabase() {
    assertPostgresEnv();
    await postgres.initDatabase();
    dbPath = postgres.dbPath;
}

export async function closeDatabase() {
    await postgres.closeDatabase?.();
}

export async function loadState() {
    return postgres.loadState();
}

export async function saveState(state, options) {
    return postgres.saveState(state, options);
}

export async function resetDatabase() {
    return postgres.resetDatabase();
}

export async function createDatabaseBackupFile(prefix) {
    return postgres.createDatabaseBackupFile(prefix);
}
