import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dbPath, loadState, resetDatabase, saveState } from "./database.js";

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
    if (!nextState || !Array.isArray(nextState.products) || !Array.isArray(nextState.sales)) {
        return res.status(400).json({ error: "Invalid ERP state payload." });
    }

    try {
        saveState(nextState);
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
