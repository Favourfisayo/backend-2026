# HTTP Versions Timeline: HTTP/1.0 → HTTP/1.1 → HTTP/2 → HTTP/3

This is a *high-level evolution map* of HTTP’s major versions — what changed, why it changed, and what problems each version was trying to fix.

---

## Big picture (one sentence each)

- **HTTP/1.0 (1996):** Simple request/response over TCP — usually one request per connection.
- **HTTP/1.1 (1997–1999):** Reuse connections + reduce wasted round-trips; still suffers from head-of-line blocking at the TCP level.
- **HTTP/2 (2015):** Multiplex many requests over one TCP connection to reduce latency; still limited by TCP head-of-line blocking.
- **HTTP/3 (2022+):** Moves HTTP over QUIC (UDP-based transport) to reduce latency and avoid TCP head-of-line blocking.

---

## Timeline

### 1996 — HTTP/1.0
**Core idea:** “Fetch a document” with minimal features.

**Key characteristics**
- Typically **one request per TCP connection** (connect → request → response → close).
- Very limited caching and metadata compared to later versions.
- Early web era assumptions: mostly small pages, fewer embedded assets.

**Main pain**
- Creating a new TCP connection repeatedly is expensive (handshake + slow start overhead).
- Page loads started to include more images/assets → too many connections and round-trips.

---

### 1997–1999 — HTTP/1.1
HTTP/1.1 arrived as a major practical upgrade to make the web scale better.

**Key improvements**
- **Persistent connections (Keep-Alive)** by default  
  One TCP connection can carry multiple requests/responses over time.
- **Pipelining (optional)**  
  Client can send multiple requests without waiting for each response.

**Also added / standardized**
- Better caching semantics (e.g., `Cache-Control`)
- `Host` header (enables multiple domains on one IP via virtual hosting)
- Chunked transfer encoding (streaming responses without knowing total size upfront)

**Main pains (why it still wasn’t enough)**
- **Head-of-line blocking at the HTTP level** when using pipelining:  
  Responses must come back in order, so one slow response delays the rest.
- Workaround in browsers: **open multiple TCP connections** per origin (commonly ~6).  
  Helps throughput, but increases congestion and server load.

---

### 2015 — HTTP/2
**Core idea:** Keep HTTP semantics the same, but change the *wire format* to be faster.

**Key improvements**
- **Binary framing layer** (not text-based over the wire)
- **Multiplexing**  
  Multiple streams (requests/responses) share a single TCP connection concurrently.
- **Header compression (HPACK)**  
  Reduces repetitive header overhead.
- **Server push (optional)**  
  Server can proactively send resources (often disabled in practice due to complexity/caching interactions).
- **Stream prioritization (optional)**  
  Let the client hint what’s more important.

**Main pain (what remained)**
- Still runs over **TCP**, so **TCP head-of-line blocking** can bite:  
  If a single TCP packet is lost, *all streams* on that connection can stall until retransmission completes.

---

### 2022+ — HTTP/3
**Core idea:** Keep HTTP/2-style multiplexing, but move from TCP to **QUIC** (built on UDP).

**What is QUIC (in plain terms)?**
- A transport protocol implemented largely in user space (apps/libraries), running over UDP.
- Provides reliability, congestion control, encryption, and multiplexed streams — but avoids some TCP limitations.

**Key improvements**
- **No TCP head-of-line blocking** for multiplexed streams  
  Packet loss affects only the streams whose data was lost, not everything.
- **Faster connection setup** (often fewer round-trips)
- **Connection migration**  
  Your connection can survive network changes (e.g., Wi‑Fi → mobile data) more smoothly.
- **Built-in encryption** (QUIC is tightly coupled with TLS 1.3 concepts)

**Tradeoffs / realities**
- More complexity in endpoints (browsers/servers), though mature now.
- Some networks historically treated UDP differently (less common today, but still a consideration).
- Observability and debugging can differ vs. TCP tooling (though tooling has improved).

---

## “Why did we need each upgrade?” (the motivation ladder)

1. **HTTP/1.0 → 1.1:** Too many connections + round-trips; needed reuse and better caching.
2. **HTTP/1.1 → 2:** Too many parallel TCP connections; needed multiplexing + lower overhead.
3. **HTTP/2 → 3:** TCP loss stalls multiplexed traffic; needed multiplexing without TCP head-of-line blocking.

---

## Quick comparison table

| Version | Transport | Multiplexing | Typical win | Typical pain |
|---|---|---:|---|---|
| HTTP/1.0 | TCP | No | Simple | Many connections/RTTs |
| HTTP/1.1 | TCP | “Sort of” (pipelining, rarely used) | Persistent connections | HOL blocking (HTTP-level), workarounds |
| HTTP/2 | TCP | Yes | Faster page loads, fewer connections | TCP HOL blocking on loss |
| HTTP/3 | QUIC over UDP | Yes | Better under packet loss + faster handshakes | More complex stack, UDP quirks |

---

## Mental model to remember

- **HTTP/1.x:** “One lane” (or a few lanes via multiple connections)
- **HTTP/2:** “Many lanes in one highway” (but a crash can block the whole highway because TCP)
- **HTTP/3:** “Many lanes + crashes are isolated per lane” (QUIC stream-level independence)

---

## Mini project idea (backend-friendly)
Build a tiny server and measure differences:
1. Serve a page with many small assets (e.g., 200 small files).
2. Test with:
   - HTTP/1.1 (no h2)
   - HTTP/2
   - HTTP/3 (if your stack supports it)
3. Compare:
   - Total load time
   - Number of connections
   - Behavior under simulated packet loss (use `tc netem` on Linux)

This makes the “why” of HTTP/2 and HTTP/3 painfully obvious in the best way.
