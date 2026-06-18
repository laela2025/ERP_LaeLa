import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { dbPath, loadState, resetDatabase, saveState, createDatabaseBackupFile } from "./database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, database: dbPath });
});

app.get("/api/state", (_req, res) => {
    try {
        res.json(loadState());
    } catch (error) {
        console.error("Failed to load state:", error);
        res.status(500).json({ error: "Failed to load database state." });
    }
});

app.put("/api/state", (req, res) => {
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
        const currentState = loadState();
        if (!updateUsers) {
            nextState.users = currentState.users;
        } else if (!Array.isArray(nextState.users)) {
            return res.status(400).json({ error: "Invalid users payload." });
        }

        saveState(nextState, { updateUsers });
        res.json({ ok: true });
    } catch (error) {
        console.error("Failed to save state:", error);
        res.status(500).json({ error: "Failed to save database state." });
    }
});

app.post("/api/reset", (_req, res) => {
    try {
        const state = resetDatabase();
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

        // JSON backup: business data only (users/roles stay on this machine).
        const state = loadState();
        const { users, ...businessData } = state;
        archive.append(JSON.stringify(businessData, null, 2), { name: "laela_erp_state.json" });

        // Include physical SQLite backup (for full DB restore/debug)
        archive.file(tempDbBackupPath, { name: "laela_erp.db" });

        await archive.finalize();

        // Cleanup temp DB backup after response ends
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

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }
    res.sendFile(path.join(distPath, "index.html"), (error) => {
        if (error) {
            next();
        }
    });
});

app.listen(PORT, () => {
    console.log(`LaeLa ERP API running at http://localhost:${PORT}`);
    console.log(`SQLite database: ${dbPath}`);
});
