import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(process.argv[2] || 'services/website/out');
const port = Number(process.env.PORT || 3000);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function resolveRequestPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0] || '/');
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = path.join(rootDir, safePath);

  if (decodedPath.endsWith('/')) {
    return path.join(candidate, 'index.html');
  }
  return candidate;
}

async function readCandidate(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return readFile(path.join(filePath, 'index.html'));
    }
    return readFile(filePath);
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const requestPath = req.url || '/';
  const filePath = resolveRequestPath(requestPath);
  let body = await readCandidate(filePath);
  let statusCode = 200;
  let contentPath = filePath;

  if (!body) {
    const fallback = path.join(rootDir, '404.html');
    body = await readCandidate(fallback);
    statusCode = 404;
    contentPath = fallback;
  }

  if (!body) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const contentType =
    mimeTypes.get(path.extname(contentPath).toLowerCase()) ||
    'application/octet-stream';

  res.writeHead(statusCode, { 'content-type': contentType });
  res.end(body);
}).listen(port, () => {
  console.log(`Serving ${rootDir} on http://localhost:${port}`);
});
