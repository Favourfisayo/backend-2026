# HTTP/1.1 Server — Application Layer Notes

## What this server does

A minimal Node.js HTTP/1.1 server demonstrating **persistent connections** and basic routing.

---

## How it ties to the Application Layer

The **Application Layer** (Layer 7 in OSI) is where HTTP lives. It defines the rules for how clients and servers talk to each other — request format, response format, status codes, and headers.

This server implements those rules directly.

---

## Key HTTP/1.1 concepts in the code

### 1. Persistent Connections (Keep-Alive)
```
server.keepAliveTimeout = 5000;
```
In **HTTP/1.0**, every request opened a new TCP connection and closed it after the response. Wasteful.

**HTTP/1.1 made Keep-Alive the default.** One TCP connection stays open and serves multiple requests/responses back to back. The server only closes it after `keepAliveTimeout` ms of idle time.

This is visible in the request log:
```
[GET] / — keep-alive: keep-alive
```

---

### 2. Request/Response structure
```
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify(...));
```
This mirrors the HTTP message format the Application Layer defines:
- **Status line** → `HTTP/1.1 200 OK` (Node writes this from `writeHead`)
- **Headers** → `Content-Type`, `Connection`, etc.
- **Body** → the actual data

---

### 3. Routing by method + path
```
const handler = routes[req.method][req.url];
```
HTTP's Application Layer contract says the client must send a **method** (`GET`, `POST`, …) and a **path** (`/`, `/about`). The server decides what to do based on those — this is that decision.

---

### 4. Body streaming on POST
```
req.on("data", chunk => body += chunk);
req.on("end", () => { ... });
```
HTTP allows a request **body**. It arrives as a stream of chunks at the Application Layer, so you accumulate them before processing.

---

## Quick test

```bash
# Start the server
node http-server-advanced.js

# Test routes
curl http://localhost:3000/
curl http://localhost:3000/about
curl -X POST http://localhost:3000/echo -d "hello world"

# See Keep-Alive header in action
curl -v http://localhost:3000/ 2>&1 | grep -i connection
```

---

## Summary

| Concept | HTTP/1.1 rule | Where in code |
|---|---|---|
| Persistent connection | Keep-Alive on by default | `keepAliveTimeout` |
| Status codes | 200 OK, 404 Not Found | `res.writeHead(...)` |
| Headers | Content-Type, Connection | `writeHead` second arg |
| Methods & paths | Client declares method + URL | `req.method`, `req.url` |
| Request body | Arrives as a stream | `req.on("data", ...)` |
