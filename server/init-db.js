import { initDatabase, closeDatabase, dbPath, dbEngine } from "./database.js";

await initDatabase();
await closeDatabase();
console.log(`Database ready (${dbEngine}): ${dbPath}`);
