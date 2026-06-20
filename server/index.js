import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";
import {
    initDatabase,
    dbPath,
    dbEngine,
    loadState,
    resetDatabase,
    saveState,
    createDatabaseBackupFile
} from "./database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const defaultOrigins = [
    "http://localhost:3001",
    "http://localhost:5173",
    "https://erp.laela.online",
    "https://www.erp.laela.online",
    "https://laela2025.github.io"
];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    }
}));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, engine: dbEngine, database: dbPath });
});

app.get("/api/state", async (_req, res) => {
    try {
        res.json(await loadState());
    } catch (error) {
        console.error("Failed to load state:", error);
        res.status(500).json({ error: "Failed to load database state." });
    }
});

app.put("/api/state", async (req, res) => {
    const nextState = req.body;
    const updateUsers = req.get("X-Update-Users") === "true";
    if (
        !nextState
        || !Array.isArray(nextState.products)
        || !Array.isArray(nextState.sales)
        || !Array.isArray(nextState.categories)
        || !Array.isArray(nextState.expenses)
        || !Array.isArray(nextState.purchases)
    ) {
        return res.status(400).json({ error: "Invalid ERP state payload." });
    }

    try {
        const currentState = await loadState();
        if (!updateUsers) {
            nextState.users = currentState.users;
        } else if (!Array.isArray(nextState.users)) {
            return res.status(400).json({ error: "Invalid users payload." });
        }

        await saveState(nextState, { updateUsers });
        res.json({ ok: true });
    } catch (error) {
        console.error("Failed to save state:", error);
        res.status(500).json({
            error: "Failed to save database state.",
            detail: error.message
        });
    }
});

app.post("/api/reset", async (_req, res) => {
    try {
        const state = await resetDatabase();
        res.json(state);
    } catch (error) {
        console.error("Failed to reset database:", error);
        res.status(500).json({ error: "Failed to reset database." });
    }
});

app.get("/api/backup/full", async (_req, res) => {
    let tempDbBackupPath = null;
    try {
        tempDbBackupPath = await createDatabaseBackupFile("laela_erp_db");

        const dateTag = new Date().toISOString().substring(0, 10);
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename=\"laela_erp_full_backup_${dateTag}.zip\"`);

        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.on("error", (err) => {
            throw err;
        });

        archive.pipe(res);

        const state = await loadState();
        const { users, ...businessData } = state;
        archive.append(JSON.stringify(businessData, null, 2), { name: "laela_erp_state.json" });

        if (dbEngine === "sqlite") {
            archive.file(tempDbBackupPath, { name: "laela_erp.db" });
        } else {
            archive.file(tempDbBackupPath, { name: "laela_erp_postgres.json" });
        }

        await archive.finalize();

        res.on("close", () => {
            if (tempDbBackupPath && fs.existsSync(tempDbBackupPath)) {
                try { fs.unlinkSync(tempDbBackupPath); } catch { /* ignore */ }
            }
        });
    } catch (error) {
        console.error("Failed to create full backup:", error);
        if (tempDbBackupPath && fs.existsSync(tempDbBackupPath)) {
            try { fs.unlinkSync(tempDbBackupPath); } catch { /* ignore */ }
        }
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate backup archive." });
        } else {
            res.end();
        }
    }
});

const API_ONLY = process.env.LAELA_API_ONLY === "true" || process.env.LAELA_API_ONLY === "1";

if (!API_ONLY) {
    const projectRoot = path.join(__dirname, "..");
    const distPath = path.join(projectRoot, "dist");
    const staticRoot = fs.existsSync(path.join(distPath, "index.html")) ? distPath : projectRoot;

    app.use(express.static(staticRoot, { index: "index.html" }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path.join(staticRoot, "index.html"), (error) => {
            if (error) {
                next(error);
            }
        });
    });
} else {
    app.get("/", (_req, res) => {
        res.json({
            service: "LaeLa ERP API",
            frontend: "https://erp.laela.online",
            health: "/api/health"
        });
    });
}

await initDatabase();

app.listen(PORT, HOST, () => {
    if (API_ONLY) {
        console.log(`LaeLa ERP API-only mode (no frontend on this server)`);
        console.log(`Frontend: https://erp.laela.online (GitHub Pages)`);
    } else {
        console.log(`LaeLa ERP running at http://localhost:${PORT}`);
    }
    console.log(`API: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api`);
    console.log(`Database engine: ${dbEngine}`);
    console.log(`Database: ${dbPath}`);
});
