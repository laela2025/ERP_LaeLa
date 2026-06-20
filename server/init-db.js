import { initDatabase, closeDatabase, dbPath } from "./database.js";

await initDatabase();
await closeDatabase();
console.log(`Database ready (PostgreSQL): ${dbPath}`);
