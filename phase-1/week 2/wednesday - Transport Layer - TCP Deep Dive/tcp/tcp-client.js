// tcp-client.js
const net = require("net");
const readline = require("readline");

const PORT = 5000;
const HOST = "localhost";

const client = net.createConnection({ port: PORT, host: HOST }, () => {
  console.log("Connected to TCP server");
  console.log("Type messages and press Enter. Commands: /help, /nick, /list, /ping, /quit");
});

client.setEncoding("utf8");

// Same idea as the server: TCP is a stream, so we buffer and split by '\n'
let buffer = "";

client.on("data", (chunk) => {
  buffer += chunk;

  let idx;
  while ((idx = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, idx).trimEnd();
    buffer = buffer.slice(idx + 1);

    if (line.length > 0) console.log(line);
    else console.log(""); // keep empty lines if any
  }
});

client.on("end", () => console.log("Disconnected (server ended)"));
client.on("close", () => console.log("Connection closed"));
client.on("error", (err) => console.log("Error:", err.message));

// Read from terminal and send to server
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (line) => {
  // Our protocol: each message is one line, so we MUST add "\n"
  const ok = client.write(line + "\n");

  // Optional: show backpressure (rare in small chats, but real in big sends)
  if (!ok) {
    rl.pause();
    client.once("drain", () => rl.resume());
  }

  if (line.trim().toLowerCase() === "/quit") {
    rl.close();
  }
});

rl.on("close", () => {
  // If user closes stdin, end socket gracefully
  if (!client.destroyed) client.end();
});