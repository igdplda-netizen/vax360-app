const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const DIST_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // 1. Decode URL to prevent percent-encoded traversal attacks (e.g. %2e%2e%2f)
  let safeUrl = '/';
  try {
    safeUrl = decodeURIComponent(req.url);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  // Remove query parameters or hash segments
  const cleanPath = safeUrl.split('?')[0].split('#')[0];

  // 2. Resolve target file path
  const resolvedDistDir = path.resolve(DIST_DIR);
  let filePath = path.join(resolvedDistDir, cleanPath === '/' ? 'index.html' : cleanPath);
  let resolvedPath = path.resolve(filePath);

  // 3. Enforce strict document root check to prevent directory traversal
  if (resolvedPath !== resolvedDistDir && !resolvedPath.startsWith(resolvedDistDir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // 4. Fallback to index.html for SPA routing if the file does not exist
  if (!fs.existsSync(resolvedPath)) {
    resolvedPath = path.join(resolvedDistDir, 'index.html');
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(resolvedPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
