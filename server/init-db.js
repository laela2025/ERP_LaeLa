import { db, dbPath } from "./database.js";

db.close();
console.log(`Database ready: ${dbPath}`);
