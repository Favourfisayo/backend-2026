# UDP Notes — What We Discussed (Favour Fisayo)

## 1) What UDP is (in plain English)
UDP (User Datagram Protocol) is a **transport-layer** protocol that sits above IP. It’s designed to be **minimal**:

- It **doesn’t set up a connection** (no handshake).
- It **doesn’t guarantee delivery**, ordering, or retransmission.
- It **does** provide **ports** (so the OS can deliver packets to the right app) and a **checksum** (to detect corruption).

Mental model:
- **IP** tries its best to deliver packets (best-effort).
- **UDP** adds the bare minimum on top of IP: “this belongs to app X (port), and here’s an integrity check (checksum).”

RFC: UDP is specified in RFC 768.

---

## 2) Why people use UDP
UDP is often used when you care about:
- **Low latency** (don’t wait for retransmissions or ordering),
- **Simple request/response** (like DNS),
- **App-controlled reliability** (you decide which messages need retries),
- **Real-time data** where late data is useless.

Examples:
- **DNS** queries (fast request/response).
- **Voice/video calls** (better to drop a late audio frame than stall).
- **Online games** (position updates should be “latest,” not “perfectly delivered”).
- **Telemetry** (lots of small updates where losing a few is fine).

---

## 3) UDP Datagram structure
A UDP datagram is:

**UDP Header (8 bytes) + Application Data (payload)**

### UDP header fields (always 8 bytes total)
Each field is **2 bytes (16 bits)**:

1. **Source Port** (16 bits)
2. **Destination Port** (16 bits)
3. **Length** (16 bits) → total UDP size: header + data
4. **Checksum** (16 bits) → detects corruption

So: `4 fields × 2 bytes = 8 bytes`.

### Maximum UDP payload size (common textbook math)
UDP length field is 16 bits ⇒ max UDP datagram size is `2^16 = 65,536` bytes.
UDP header is 8 bytes ⇒ maximum payload (data) is:

`65,536 - 8 = 65,528 bytes`

(Real-world limits are often smaller because IP path MTU matters and fragmentation is painful.)

---

## 4) UDP Length field (the two questions you asked)
### Key rule
**UDP Length = UDP header (8 bytes) + UDP payload (application data)**

#### Q1: App gives 10 bytes of data. What goes in Length?
- Header = 8 bytes
- Data = 10 bytes
- Total = 18 bytes

18 in hex = `0x0012`

✅ **Answer: `0x0012`**

#### Q2: Length field is `0x0008`. How many bytes of application data?
- Total UDP length = 8 bytes
- Header alone = 8 bytes
- Data = 8 − 8 = 0 bytes

✅ **Answer: 0 bytes**

Important: UDP can legally carry **no payload** (header-only datagram).

---

## 5) UDP “doesn’t enforce speed” — what that really means
UDP doesn’t magically make the network faster.

What it does is **remove** things TCP does that can add latency:
- No connection setup handshake
- No in-order delivery waiting
- No retransmission waiting (by default)

So UDP often *feels* “faster” (lower latency) because it avoids delays caused by reliability machinery.

---

## 6) “UDP allows protocols to be built on top of it” — meaning
UDP is a minimal carrier. Because it doesn’t force reliability/ordering/etc., you can implement your own rules in software.

So “protocol on top of UDP” means:
- You create your own packet format inside UDP payload
- You add your own logic like:
  - sequence numbers
  - acknowledgements (ACKs)
  - retransmissions
  - ordering rules
  - prioritization
  - flow control / congestion control (if you’re serious)

### Your refined takeaway
✅ UDP doesn’t enforce speed  
✅ UDP removes TCP behaviors that may add latency  
✅ Your own custom logic can enforce **reliability only where needed**

---

## 7) QUIC: the famous “custom transport over UDP”
QUIC is a transport protocol built over UDP that aims to reduce latency versus TCP+TLS, while still providing:
- reliability
- congestion control
- encryption (TLS integrated)
- multiple independent streams (multiplexing)

### Why QUIC can reduce latency
- **Faster setup** (transport + crypto handshake integrated)
- **Streams** help avoid a big TCP pain point: head-of-line blocking
- **User-space evolvability**: it can be updated faster than kernel TCP stacks

---

## 8) TCP head-of-line (HOL) blocking — explained again
### The core idea
TCP delivers data to the application as a **single ordered byte stream**.

So if TCP sent “chunks” (conceptually):
A, B, C, D

…and **B** is lost, but C and D arrive…

TCP says:
> “I can’t deliver C and D to the app until B is retransmitted and arrives.”

So C and D are stuck waiting behind B, even though they’re already here.

That waiting is **head-of-line blocking**:
- the missing thing at the “front of the line” blocks everything behind it

### Why this matters in modern web
HTTP/2 multiplexes many logical streams (CSS, JS, images) over one TCP connection.
But TCP still sees one ordered stream underneath.
So a single packet loss can stall multiple unrelated resources.

### How QUIC helps
QUIC has **independent streams** at the transport layer.
If one stream loses a packet, other streams can still progress.
That reduces “global freezing” due to loss.

---

## 9) UDP Checksum — the part you struggled with (made simple)
### What checksum is trying to do
It detects corruption. If bits flip in transit, checksum often changes.

### What “group into 16-bit words” means
- 1 byte = 8 bits
- 16 bits = 2 bytes
So we take the data **two bytes at a time** and treat each pair as a 16-bit number.

Example:
Bytes: `12 34 56 78`
Grouped into 16-bit words:
- `12 34` → `0x1234`
- `56 78` → `0x5678`

### UDP checksum algorithm (simplified)
1) Break into 16-bit words (2 bytes each)  
2) Add them using **one’s complement addition**  
3) Take the **one’s complement** (bitwise flip) of the final sum

> One’s complement addition: if there’s overflow beyond 16 bits, wrap the carry around and add it back in.

### Your original checksum question
> First 6 bytes: `01 01 01 01 00 08`  
Compute checksum.

#### Step A — Group into 16-bit words:
`01 01 01 01 00 08` becomes:
- `01 01` → `0x0101`
- `01 01` → `0x0101`
- `00 08` → `0x0008`

#### Step B — Add them:
- `0x0101 + 0x0101 = 0x0202`
- `0x0202 + 0x0008 = 0x020A`

No overflow beyond 16 bits here.

#### Step C — One’s complement (flip bits)
Flip all bits of `0x020A` → `0xFDF5`

✅ **Checksum = `0xFDF5`**

### Why the flip works
At the receiver, if you add:
(all 16-bit words) + (checksum)
You should get `0xFFFF` if nothing was corrupted.

---

## 10) Clearing up the confusion you had: “6 bytes means no data?”
No. The checksum question giving you **6 bytes** does *not* imply the whole UDP datagram is 6 bytes.

Those 6 bytes were just “the bytes we’re using in this checksum exercise.”
A UDP datagram includes:
- UDP header (8 bytes)
- payload (0+ bytes)

So 6 bytes could be part of the payload, part of the header+payload region being checksummed, or just a training example slice.

---

## 11) A practical “UDP custom reliability” example (mini-protocol)
Imagine a multiplayer game.

Message types:
- `STATE`: player position updates (don’t retry; drop if lost)
- `EVENT`: “shot fired” (retry until acknowledged)
- `CHAT`: must be reliable + ordered

Over UDP, you can design your own payload format like:

- message_type (1 byte)
- sequence_number (2 bytes)
- timestamp_ms (4 bytes)
- ack_number (2 bytes, optional)
- payload (...)

Logic:
- `STATE`: ignore old timestamps, no retries
- `EVENT`: require ACK, retry if timeout
- `CHAT`: buffer and reorder using sequence numbers

That’s exactly what “build protocols on top of UDP” looks like.

---

## 12) Mini-project to make UDP feel real (recommended)
### Project: “Selective Reliability UDP”
Build a tiny UDP client/server that supports:
- `STATE` messages (unreliable)
- `EVENT` messages (reliable via ACK + retransmit)

Checklist:
- Add a sequence number to every message.
- Server sends ACK for `EVENT`.
- Client retries `EVENT` if no ACK within timeout.
- For `STATE`, server just prints latest and discards older timestamps.

Goal:
You’ll *feel* the tradeoff between latency and reliability, and you’ll understand why QUIC exists.

---

## 13) One-liners to remember
- UDP = **no handshake, no guarantees**, minimal overhead.
- UDP Length field = **header (8) + data**.
- UDP Checksum = **one’s complement of sum of 16-bit words** (with carry wrap-around), then flip bits.
- TCP HOL blocking = **missing earlier data stalls later data** due to in-order delivery.
- QUIC = modern transport over UDP that brings back reliability + streams + crypto, while avoiding some TCP pain.
