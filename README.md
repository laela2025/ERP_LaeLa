# LaeLa ERP

PostgreSQL is the **only** database for this project. All business data (products, sales, purchases, expenses, categories) is stored in PostgreSQL and accessed through the Node API.

- **Frontend:** https://erp.laela.online (GitHub Pages)
- **API:** https://api.laela.online:27015 → Node → PostgreSQL

## Local development (Windows)

1. Copy environment file:

```powershell
copy .env.example .env
```

2. Edit `.env` with your PostgreSQL connection:

```env
PG_HOST=202.164.150.65
PG_PORT=27010
PG_USER=erpadmin
PG_PASSWORD=your_password
PG_DATABASE=erpdb
PORT=3001
HOST=127.0.0.1
```

3. Install and run:

```powershell
npm install
npm run db:init
npm start
```

Open http://localhost:3001

## Production API server

See `deploy/SETUP-API-DOMAIN.md` and `.env.server.example`.

```bash
cp .env.server.example .env
# edit PG_* credentials
npm install --omit=dev
npm run db:init
npm run start:api
```

## Backup

Use **Settings → Download Full Backup** in the ERP UI, or:

```bash
curl -OJ https://api.laela.online:27015/api/backup/full
```

Backups contain JSON state plus a PostgreSQL snapshot file.

## Notes

- SQLite and browser `localStorage` data storage have been removed.
- The app does not load or save business data unless the PostgreSQL API is connected.
- Keep database credentials private. Do not commit `.env`.
