const dgram = require("dgram")

const HOST = "0.0.0.0"
const PORT = 41234

const server = dgram.createSocket("udp4")

// Fires when a UDP datagram arrives
server.on("message", (msg, rinfo) => {
  const text = msg.toString("utf8");
  console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}: "${text}"`);

  // Echo it back
  const reply = Buffer.from(`echo: ${text}`, "utf8");
  server.send(reply, rinfo.port, rinfo.address, (err) => {
    if (err) console.error("send error:", err);
  });
});

server.on("listening", () => {
  const addr = server.address();
  console.log(`UDP server listening on ${addr.address}:${addr.port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  server.close();
});

// Start listening
server.bind(PORT, HOST);