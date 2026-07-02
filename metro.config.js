const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

config.watchFolders = config.watchFolders || [];
if (!Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList = [config.resolver.blockList].filter(Boolean);
}
config.resolver.blockList.push(/\.cache[\/\\]dotslash/);
config.resolver.blockList.push(/backend/);
config.resolver.blockList.push(/www/);

// Proxy /api/* requests from the Metro/Expo dev server (port 5000, the only
// publicly reachable port in this workspace) to the backend Express API
// (port 5011, which is not reachable via the public dev domain). This keeps
// the frontend and API on the same origin during development, matching how
// production (server.js) already serves both from a single origin.
const BACKEND_PORT = process.env.PORT || 5011;
const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const middleware = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    if (req.url && req.url.startsWith('/api')) {
      const proxyReq = http.request(
        {
          host: 'localhost',
          port: BACKEND_PORT,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: `localhost:${BACKEND_PORT}` },
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      );
      proxyReq.on('error', (err) => {
        console.error('[api-proxy] error forwarding', req.url, err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: 'API backend unreachable' }));
      });
      req.pipe(proxyReq, { end: true });
      return;
    }
    return middleware(req, res, next);
  };
};

module.exports = config;
