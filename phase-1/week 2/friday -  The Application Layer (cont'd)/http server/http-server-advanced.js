const http = require("http");

const PORT = 3000;

const routes = {
  GET: {
    "/": (req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Welcome to the HTTP/1.1 server!");
    },
    "/about": (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ name: "HTTP/1.1 Demo", version: "1.0" }));
    },
  },
  POST: {
    "/echo": (req, res) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ received: body }));
      });
    },
  },
};

const server = http.createServer((req, res) => {
  const method = routes[req.method];
  const handler = method && method[req.url];

  // Log each request — one TCP connection can carry many of these
  console.log(`[${req.method}] ${req.url} — keep-alive: ${req.headers["connection"] || "not set"}`);

  if (!handler) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404 Not Found");
  }

  handler(req, res);
});

// HTTP/1.1 persistent connections: keepAliveTimeout controls how long an idle
// connection stays open waiting for the next request before the server closes it.
server.keepAliveTimeout = 5000; // 5 seconds idle before closing

// headersTimeout must be > keepAliveTimeout to avoid a race condition
server.headersTimeout = 6000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Persistent connections (Keep-Alive) are ON by default in HTTP/1.1");
});
