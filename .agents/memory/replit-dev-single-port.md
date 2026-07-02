---
  name: Replit dev: single public port only
  description: Why hardcoding a second backend port (e.g. :5011) in frontend API URLs breaks in the Replit dev workspace, and the same-origin proxy fix.
  ---

  In the Replit dev workspace, only one port (the one mapped as the primary/webview port in .replit, e.g. 5000) is reachable from the browser via the public dev domain (REPLIT_DEV_DOMAIN). Appending a different port to that same hostname (e.g. `https://<domain>:5011`) does NOT work — Replit's HTTPS proxy terminates at 443 and does not forward arbitrary port suffixes on the dev domain, even if that port is also declared in [[ports]] in .replit.

  **Why:** Vax360 had a separate Express backend on port 5011 (declared as its own external port in .replit) alongside an Expo dev server on port 5000. The frontend built API URLs as `https://${hostname}:5011/api`, which worked from inside the container (curl to localhost:5011) but failed from any real browser/canvas hitting the public dev domain — surfacing as generic "Server connection failed" on login/register.

  **How to apply:** When a Replit project runs multiple backend processes on different ports in dev, don't have the frontend address the second port directly by domain. Instead, proxy same-origin: add a middleware/proxy on the primary port's dev server (e.g. Metro's `config.server.enhanceMiddleware` for Expo) that forwards specific path prefixes (e.g. `/api/*`) to the internal backend port, and have the frontend always call `window.location.origin + '/api'` (or the equivalent same-origin path). This mirrors how production typically serves frontend+API from one origin anyway.
  