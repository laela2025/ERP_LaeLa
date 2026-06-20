# Setup api.laela.online → 202.164.150.65 (Nginx + SSL)

Frontend: **https://erp.laela.online** (GitHub Pages)  
API: **https://api.laela.online** → Node on port **3001** → PostgreSQL **erpdb**

---

## Step 1 — DNS

At your domain registrar (where `laela.online` is managed), add:

| Type | Name | Value        | TTL  |
|------|------|--------------|------|
| A    | api  | 202.164.150.65 | 300 |

Wait 5–30 minutes, then verify:

```bash
dig +short api.laela.online
# should show: 202.164.150.65
```

---

## Step 2 — Install Nginx and Certbot (on TESTUBNSQL02)

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Open firewall (if ufw is enabled):

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## Step 3 — Nginx site config

From the project folder:

```bash
cd ~/ERP_LaeLa
sudo cp deploy/nginx-api.laela.online.conf /etc/nginx/sites-available/api.laela.online
sudo ln -sf /etc/nginx/sites-available/api.laela.online /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # optional, if it conflicts
sudo nginx -t
sudo systemctl reload nginx
```

Test HTTP (before SSL):

```bash
curl http://api.laela.online/api/health
```

(API must be running: `node server/index.js` or systemd service)

---

## Step 4 — SSL certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.laela.online
```

Follow prompts (email, agree to terms). Choose redirect HTTP → HTTPS when asked.

Test HTTPS:

```bash
curl https://api.laela.online/api/health
```

Auto-renewal is installed by certbot. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 5 — Run API as a service (always on)

```bash
cd ~/ERP_LaeLa
sudo cp deploy/laela-erp-api.service /etc/systemd/system/
# Edit User/WorkingDirectory if not sysuser:
# sudo nano /etc/systemd/system/laela-erp-api.service

sudo systemctl daemon-reload
sudo systemctl enable laela-erp-api
sudo systemctl start laela-erp-api
sudo systemctl status laela-erp-api
```

---

## Step 6 — GitHub Pages frontend

Ensure `api-config.js` on GitHub has:

```js
window.LAELA_API_BASE = "https://api.laela.online/api";
```

Push to GitHub, then open **https://erp.laela.online** — Settings should show database connected.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `dig` doesn't show 202.164.150.65 | Wait for DNS; check A record |
| 502 Bad Gateway | API not running — `sudo systemctl start laela-erp-api` |
| certbot fails | Port 80 must reach this server; DNS must point here first |
| CORS error in browser | `.env` must include `CORS_ORIGINS=https://erp.laela.online` |
