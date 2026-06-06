// tcp-server.js
const net = require("net");

const PORT = 5000;
const HOST = "localhost";

// Track connected clients
const clients = new Set();

function broadcast(fromSocket, text) {
  for (const sock of clients) {
    if (sock !== fromSocket && !sock.destroyed) {
      sock.write(text);
    }
  }
}

function safeWrite(sock, text) {
  if (!sock.destroyed) sock.write(text);
}

const server = net.createServer((socket) => {
  socket.setEncoding("utf8");

  // Per-client state
  socket._buffer = ""; // holds partial data until we have full lines
  socket._nick = `user-${Math.floor(Math.random() * 10000)}`;

  clients.add(socket);

  console.log(`[+] connected: ${socket.remoteAddress}:${socket.remotePort} as ${socket._nick}`);
  safeWrite(socket, `Welcome ${socket._nick}!\nType /help for commands.\n`);

  broadcast(socket, `[*] ${socket._nick} joined the chat\n`);

  socket.on("data", (chunk) => {
    // IMPORTANT: TCP is a stream. chunk might be partial, full, or multiple messages.
    socket._buffer += chunk;

    // Our protocol rule: messages are separated by newline "\n"
    let idx;
    while ((idx = socket._buffer.indexOf("\n")) !== -1) {
      const line = socket._buffer.slice(0, idx).trimEnd(); // remove trailing \r or spaces
      socket._buffer = socket._buffer.slice(idx + 1);

      if (line.length === 0) continue;
      handleLine(socket, line);
    }
  });

  socket.on("end", () => {
    // Peer half-closed (they stopped sending)
    console.log(`[-] end: ${socket._nick}`);
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.log(`[-] closed: ${socket._nick}`);
    broadcast(socket, `[*] ${socket._nick} left the chat\n`);
  });

  socket.on("error", (err) => {
    console.log(`[!] socket error (${socket._nick}):`, err.message);
  });
});

function handleLine(socket, line) {
  // Commands start with "/"
  if (line.startsWith("/")) {
    const [cmdRaw, ...rest] = line.slice(1).split(" ");
    const cmd = (cmdRaw || "").toLowerCase();
    const arg = rest.join(" ").trim();

    switch (cmd) {
      case "help": {
        safeWrite(
          socket,
          [
            "Commands:",
            "/nick <name>   - set your nickname",
            "/msg <text>    - send a chat message",
            "/list          - list connected users",
            "/ping          - server replies PONG",
            "/quit          - disconnect",
            "",
            "Tip: you can also just type text without /msg",
            "",
          ].join("\n")
        );
        break;
      }

      case "nick": {
        if (!arg) return safeWrite(socket, "Usage: /nick <name>\n");
        const old = socket._nick;
        socket._nick = arg.slice(0, 24);
        safeWrite(socket, `OK nick set to ${socket._nick}\n`);
        broadcast(socket, `[*] ${old} is now ${socket._nick}\n`);
        break;
      }

      case "msg": {
        if (!arg) return safeWrite(socket, "Usage: /msg <text>\n");
        broadcast(socket, `[${socket._nick}] ${arg}\n`);
        // also echo back to sender so they see it
        safeWrite(socket, `[you] ${arg}\n`);
        break;
      }

      case "list": {
        const names = [...clients].filter(s => !s.destroyed).map((s) => s._nick);
        safeWrite(socket, `Users (${names.length}): ${names.join(", ")}\n`);
        break;
      }

      case "ping": {
        safeWrite(socket, "PONG\n");
        break;
      }

      case "quit": {
        safeWrite(socket, "Bye!\n");
        socket.end(); // graceful close
        break;
      }

      default:
        safeWrite(socket, `Unknown command: /${cmd}\nType /help\n`);
    }

    return;
  }

  // If it's not a command, treat it like a chat message
  broadcast(socket, `[${socket._nick}] ${line}\n`);
  safeWrite(socket, `[you] ${line}\n`);
}

server.listen(PORT, HOST, () => {
  console.log(`TCP chat server listening on ${HOST}:${PORT}`);
});