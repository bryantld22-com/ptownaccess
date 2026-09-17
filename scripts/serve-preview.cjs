const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../dist');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.css': 'text/css' };

// Local export preview only. Production privacy is enforced by Sites hosting.
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end(); return; }

  let file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
  if (!path.extname(file) || (fs.existsSync(file) && fs.statSync(file).isDirectory())) file += '.html';

  let status = 200;
  if (!fs.existsSync(file)) {
    // Match the exported dynamic route shell so server and client recovery agree.
    const fallback = /^\/events\/[^/]+\/?$/.test(pathname) ? 'events/[id].html'
      : /^\/programs\/[^/]+\/?$/.test(pathname) ? 'programs/[id].html'
      : /^\/media\/[^/]+\/?$/.test(pathname) ? 'media/[id].html'
      : /^\/[^/.]+\/?$/.test(pathname) ? '[section].html' : '+not-found.html';
    file = path.join(root, fallback);
    status = 404;
  }
  try {
    response.writeHead(status, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(fs.readFileSync(file));
  } catch { response.writeHead(500); response.end('Build the web export before starting the preview.'); }
}).listen(8081, '127.0.0.1', () => console.log('PTown Access preview: http://127.0.0.1:8081'));
