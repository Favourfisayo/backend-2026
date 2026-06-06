# UDP vs TCP Comparison
*Performance test outline + use-cases + real-world examples (Node.js-friendly)*

## 1) UDP vs TCP at a glance

### What they **guarantee**
- **TCP**
  - Reliable delivery (retransmits losses)
  - In-order delivery (bytes delivered in sequence)
  - Congestion control + flow control (tries to be “fair” and not overload links/receivers)
  - Connection-oriented (handshake + teardown)
- **UDP**
  - Message-oriented (“datagrams”)
  - No delivery guarantee, no ordering guarantee, no retransmits by default
  - Minimal overhead; no connection setup
  - Optional checksum for corruption detection (error detection, not correction)

### What they “feel” like
- **TCP:** “We will deliver everything, in order, even if we must wait.”
- **UDP:** “We will send quickly; if something is lost/late, the app decides what to do.”

---

## 2) Performance test outline (clear + descriptive)

This is an **outline** you can follow to measure and compare **latency, jitter, loss behavior, throughput, CPU cost, and tail latency** for UDP vs TCP.

### A. Define what you’re measuring (metrics)
Pick a small set so results are interpretable:

1) **Latency (RTT)**
- Median (p50), p95, p99 round-trip time for request→response

2) **Jitter**
- Variation in RTT (e.g., standard deviation, or p95–p50)

3) **Throughput**
- Bytes/sec or messages/sec successfully received

4) **Loss / retransmits**
- UDP: % messages not received within a deadline
- TCP: retransmission rate (if measurable) + stalls

5) **Tail behavior**
- Does it “freeze” occasionally? Compare p99 and worst-case RTT

6) **CPU overhead**
- Sender CPU%, receiver CPU% at same offered load

---

### B. Build two minimal test systems (same app logic)
You want **apples-to-apples**.

#### System 1: UDP echo benchmark
- Client sends message: `{seq, t0, payload}`
- Server replies immediately with same `{seq, t0}`
- Client computes RTT = now − t0

#### System 2: TCP echo benchmark
- Same message format + same payload sizes
- One persistent TCP connection (don’t reconnect per message; that mixes handshake cost into everything)

**Important:** Keep payload format and server logic identical. Only transport changes.

---

### C. Choose test dimensions (your “experiment matrix”)
Vary a few knobs systematically:

1) **Payload size**
- e.g., 32B, 256B, 1KB, 8KB, 32KB
- (Avoid huge UDP payloads in real networks; fragmentation can distort results.)

2) **Message rate**
- e.g., 100 msg/s, 1k msg/s, 10k msg/s

3) **Concurrency (number of clients)**
- 1, 10, 100 clients

4) **Network conditions**
- Baseline: clean local LAN
- Introduce controlled impairment (one at a time):
  - packet loss (0.1%, 1%, 3%)
  - latency (20ms, 80ms, 150ms)
  - jitter (variable delay)
  - bandwidth limit (e.g., 10 Mbps)

If you can, run tests in:
- **Same machine** (loopback) for CPU overhead and high message rates
- **LAN** (two machines) for realistic latency
- **Across the internet** (optional) for “real-world pain”

---

### D. How to introduce network impairment (simple options)
Pick one method that’s feasible for you:

1) **Linux traffic control (tc/netem)** (best control)
- Apply delay/loss/jitter to an interface.

2) **Docker network emulation**
- Run client+server in containers and apply netem in the container network.

3) **Windows alternatives**
- If you’re on Windows and can’t use `tc`, you can:
  - run a Linux VM (WSL2 or VM) and test inside it
  - or test without impairment (still useful)

---

### E. Measurement design (so results are trustworthy)
1) **Warm-up**
- Run 10–30 seconds warm-up to stabilize JIT/GC/caches.

2) **Run length**
- Each config: 60–180 seconds of measurement.

3) **Repeat**
- Run each config 3–5 times; report median + spread.

4) **Clock**
- Prefer monotonic clock (in Node, `process.hrtime.bigint()`).

5) **Deadlines**
- UDP: define a “timeout window” (e.g., 250ms). If no response, count as loss.
- TCP: don’t timeout too aggressively, or you’ll measure your timeout instead of TCP behavior.

6) **Logging**
- Don’t log per-packet in the hot path (it ruins measurements).
- Record metrics in memory; dump a summary at the end.

---

### F. What to expect (hypotheses you’re testing)
These are not “guarantees,” but typical outcomes:

- **Low loss networks (LAN/loopback):**
  - UDP may show slightly lower median latency and higher message rate capability (less overhead).
  - TCP may be very close for throughput, sometimes slightly higher for bulk transfers due to mature congestion control and batching.

- **With loss/jitter:**
  - UDP will show **higher loss** unless your app adds retries.
  - TCP will show **higher tail latency** because retransmits + in-order delivery can stall delivery (head-of-line blocking).

- **Real-time streaming style traffic:**
  - UDP can look “smoother” because late packets are discarded instead of delaying everything.

---

### G. Reporting format (simple and clear)
For each config, produce a small summary like:

- payload=256B, rate=1k msg/s, clients=10, loss=1%, delay=80ms
  - UDP: p50=…, p95=…, p99=…, loss=…%, CPU sender/receiver=…
  - TCP: p50=…, p95=…, p99=…, throughput=…, CPU sender/receiver=…

Add one paragraph interpretation:
- “UDP kept median low but dropped X%; TCP delivered all but tail latency spiked to p99=… because retransmits stalled stream.”

---

## 3) Use-case comparison (why you pick one)

### Prefer UDP when…
- You care about **low latency** and can tolerate some loss
- Your app can make smart choices:
  - drop stale updates (games, voice frames)
  - selective reliability (only retry important messages)
- You need multicast/broadcast style patterns (common on LANs)
- You’re using protocols built on UDP that already add what you need (e.g., **QUIC/HTTP3**, RTP/WebRTC)

Typical examples:
- Voice/video calls (WebRTC media)
- Online games (state updates)
- DNS queries (often UDP)
- Live telemetry metrics
- Service discovery on LAN

### Prefer TCP when…
- You need **reliability and ordering** for all data
- You’re sending “must arrive” data (files, database writes, API calls)
- You want simplicity: OS handles retransmits, ordering, congestion control

Typical examples:
- HTTPS web APIs (HTTP/1.1 and HTTP/2 over TCP; HTTP/3 uses QUIC over UDP)
- File transfer, backups
- Database connections
- Email protocols (SMTP/IMAP)

---

## 4) Real-world examples: “When to use UDP vs TCP?”

### Example A: Voice call vs File upload
- **Voice call:** UDP (or QUIC/WebRTC)  
  Late audio is worse than missing audio. A 300ms-late packet is useless.
- **File upload:** TCP  
  Every byte matters; retransmits are required.

### Example B: Online multiplayer game
- Player position updates: UDP (drop old updates)
- “Bought item” transaction: TCP (or reliable layer over UDP)
- Hybrid approach is common.

### Example C: Video streaming
- Live interactive (video call): UDP/WebRTC
- On-demand buffered streaming (Netflix-style): TCP/QUIC works well because buffering hides retransmit delays.

### Example D: DNS
- Usually UDP because requests/responses are small and fast.
- TCP fallback exists for large responses or specific cases.

---

## 5) Practical rules of thumb (quick)
- If the data is **state** (replaceable), UDP tends to fit.
- If the data is **history** (must not be lost), TCP tends to fit.
- If you want modern web transport with better latency + multiplexing, look at **QUIC/HTTP/3** (built over UDP).

---

## 6) Mini project idea (to lock it in)
Build a “dual transport ping” tool:
- `udp-ping`: sends seq+t0, counts loss + RTT distribution
- `tcp-ping`: persistent connection, same payload, same metrics
- Add an option `--loss=1% --delay=80ms` if you run on Linux with netem (or inside a Linux VM)

This will make the tradeoffs visceral: UDP drops; TCP stalls (tail latency).
