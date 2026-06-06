
const dgram = require("dgram");

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 41234;

const client = dgram.createSocket("udp4");

client.on("message", (msg, rinfo) => {
  console.log(`Reply from ${rinfo.address}:${rinfo.port}: "${msg.toString("utf8")}"`);
  client.close();
});

client.on("error", (err) => {
  console.error("Client error:", err);
  client.close();
});

const payload = Buffer.from("hello udp", "utf8");
client.send(payload, SERVER_PORT, SERVER_HOST, (err) => {
  if (err) console.error("send error:", err);
  else console.log("Sent:", payload.toString("utf8"));
});