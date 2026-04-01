const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

function resolvePath(urlPath) {
  const normalizedPath = decodeURIComponent(urlPath.split("?")[0]);
  const requestPath = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const absolutePath = path.normalize(path.join(root, requestPath));

  if (!absolutePath.startsWith(root)) {
    return null;
  }

  return absolutePath;
}

const server = http.createServer((req, res) => {
  const targetPath = resolvePath(req.url || "/");

  if (!targetPath) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(targetPath, (error, data) => {
    if (error) {
      send(res, 404, "Not found");
      return;
    }

    const contentType = mimeTypes[path.extname(targetPath).toLowerCase()] || "application/octet-stream";
    send(res, 200, data, contentType);
  });
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
