let driver = null;

export let dbPath = "";
export let dbEngine = "sqlite";

function resolveEngine() {
    const explicit = process.env.LAELA_DB_ENGINE?.trim().toLowerCase();
    if (explicit === "postgres" || explicit === "postgresql") {
        return "postgres";
    }
    if (explicit === "sqlite") {
        return "sqlite";
    }
    if (process.env.DATABASE_URL || process.env.PG_HOST) {
        return "postgres";
    }
    return "sqlite";
}

async function getDriver() {
    if (!driver) {
        dbEngine = resolveEngine();
        driver = dbEngine === "postgres"
            ? await import("./drivers/postgres.js")
            : await import("./drivers/sqlite.js");
        dbPath = driver.dbPath;
    }
    return driver;
}

export async function initDatabase() {
    const d = await getDriver();
    await d.initDatabase();
    dbPath = d.dbPath;
}

export async function closeDatabase() {
    const d = await getDriver();
    await d.closeDatabase?.();
}

export async function loadState() {
    const d = await getDriver();
    return d.loadState();
}

export async function saveState(state, options) {
    const d = await getDriver();
    return d.saveState(state, options);
}

export async function resetDatabase() {
    const d = await getDriver();
    return d.resetDatabase();
}

export async function createDatabaseBackupFile(prefix) {
    const d = await getDriver();
    return d.createDatabaseBackupFile(prefix);
}
