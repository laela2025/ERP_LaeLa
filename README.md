# LaeLa ERP

## Database in git (with live-data protection)

This project stores the real SQLite database at `data/laela_erp.db` and can version it in git via **Git LFS**.

The goal: **keep the database in git for backup**, but **never let a normal code push/pull overwrite your live ERP data**.

### One-time setup

```powershell
git lfs install
npm run setup:git-db
npm run hooks:install
```

On this PC, if plain `git` reports *dubious ownership*, use the npm scripts above (they handle it automatically), or prefix manual git commands:

```powershell
git -c safe.directory=E:/ERP/ERP_LaeLa status
```

Commit the database once (first time or after importing real data):

```powershell
git add data/laela_erp.db .gitattributes
git commit -m "Add ERP database"
git push
```

### Put the live database in git

```powershell
npm run db:use-in-git
npm run db:sync
git push
npm run db:protect
```

`db:use-in-git` copies your live data to `data/laela_erp.db`, removes `LAELA_ERP_DB_PATH`, and points the app at the repo database.

### Protect live data (do this on every machine with real sales/stock data)

```powershell
npm run db:protect
```

If the database file does not exist yet, `db:protect` creates it automatically. You can also create it manually with `npm run db:init` or `npm start`.

After protection:

| Action | Effect on live `data/laela_erp.db` |
|--------|-------------------------------------|
| `git push` (code-only commits) | **No change** — DB is not included |
| `git pull` (code updates) | **No change** — git skips the DB file |
| App running / saving sales | **Works normally** — SQLite writes as usual |

Check protection anytime:

```powershell
npm run db:status
```

### When you *want* to back up real data into git

```powershell
npm run db:sync
git push
```

This temporarily unprotects, commits the current DB, then re-protects automatically.

### How it works

1. **`skip-worktree`** (via `db:protect`) — git ignores local DB changes and will not replace the file on pull/checkout.
2. **`merge=ours`** (in `.gitattributes`) — if a merge ever touches the DB, your local copy wins.
3. **`needsSeedData()`** in `server/database.js` — only fills an **empty** database; existing real data is never reset on server start.

### Alternative: database outside the repo

If you prefer not to version the DB at all, set an absolute path:

```powershell
$env:LAELA_ERP_DB_PATH = "E:\ERP_DATA\laela_erp.db"
npm start
```

The repo copy in `data/` is then unused; git changes never affect production data.

### Security note

The database contains real business data and user passwords. Keep the repository **private** and limit who can clone it.
