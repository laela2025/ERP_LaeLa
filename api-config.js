/**
 * Production (GitHub Pages at erp.laela.online):
 *   Frontend stays on GitHub Pages — only the API runs on 202.164.150.65.
 *   Set api.laela.online → 202.164.150.65 with HTTPS (Nginx + SSL).
 */
if (!/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    window.LAELA_API_BASE = "https://api.laela.online/api";
}
