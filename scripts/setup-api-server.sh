#!/bin/bash
# API-only setup for server 202.164.150.65 (Linux). Frontend stays on GitHub Pages.
set -e
cd "$(dirname "$0")/.."

echo "=== LaeLa ERP API server setup ==="

if [ ! -f .env ]; then
  cp .env.server.example .env
  echo "Created .env — edit PG_USER and PG_PASSWORD before starting."
fi

if [ ! -f server/drivers/postgres.js ]; then
  echo "ERROR: server/drivers/postgres.js missing."
  echo "Run: git pull origin main"
  echo "Or copy server/database.js, server/index.js, and server/drivers/ from your PC."
  exit 1
fi

if ! grep -q "postgres" server/database.js; then
  echo "ERROR: server/database.js must use PostgreSQL."
  echo "Run: git pull origin main"
  exit 1
fi

npm install --omit=dev
echo ""
echo "Starting API (Ctrl+C to stop)..."
echo "Frontend: https://erp.laela.online"
node server/index.js
