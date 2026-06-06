# Transport Layer Deep Notes (TCP/UDP, Reliability, Congestion, and TCP Header Fields)

> Goal: a clear, end-to-end set of notes that ties together **what the transport layer does**, **how the OS and apps participate**, **reliable data transfer**, **TCP vs UDP**, **congestion control**, **window scaling**, **Nagle’s algorithm**, and a **detailed TCP header field breakdown**.

---

## 0) Big picture: What the transport layer is “for”

The **network layer (IP)** tries to deliver packets across networks, but it is **best-effort**:

- Packets can be **lost** (drops at routers, wireless errors)
- Packets can be **corrupted** (bit errors)
- Packets can be **reordered** (different paths)
- Packets can be **duplicated** (retransmissions at lower layers or weird routing behavior)

The **transport layer** sits above IP and provides communication services to applications:

- **Multiplexing/demultiplexing**: many apps share one network interface
- **Reliability** (TCP): correct, in-order delivery
- **Flow control** (TCP): don’t overwhelm the receiver
- **Congestion control** (TCP): don’t overwhelm the network

---

## 1) Who does what in networking? (App vs OS vs hardware vs network)

### 1.1 Application
- Defines the **meaning** of data: HTTP, WebSocket, WhatsApp messages, game protocol
- Implements **app-level reliability** features: “delivered/read”, offline resend, message IDs

### 1.2 Libraries / runtime
- Provide reusable protocols/logic: TLS, HTTP parsing, WebSocket framing

### 1.3 OS kernel (the main networking engine)
- Implements **TCP/UDP/IP stack** (mostly in kernel)
- Manages **sockets**, **ports**, buffers, timers
- Performs **multiplex/demultiplex** (deliver incoming data to right process)
- Manages routing tables and interface selection

### 1.4 Hardware (NIC / Wi‑Fi chipset)
- Turns packets into signals (electrical/radio)
- Offloads tasks sometimes (checksum offload, segmentation offload)

### 1.5 Network devices (switches/routers)
- Switches forward within LAN (Layer 2)
- Routers forward between networks (Layer 3)
- Routers have **queues** where congestion physically shows up

---

## 2) Multiplexing and demultiplexing (ports + sockets)

### 2.1 Why sockets exist
A **socket** is the OS-managed endpoint an app uses to send/receive data.

- Socket = the app’s “handle” into the networking stack
- It has protocol (TCP/UDP), local address/port, and for TCP connection state

### 2.2 Multiplexing
Many applications send data through one host’s network interface. The transport layer uses:

- **Port numbers**
- plus connection identifiers (IP addresses + ports + protocol)

to keep flows separated.

### 2.3 Demultiplexing
Incoming packets are delivered to the correct socket/app by looking at:

- destination port (and protocol)
- plus IP addresses
- for TCP: the full connection 4‑tuple

**TCP connection identity (4‑tuple)**:

- (source IP, source port, destination IP, destination port)

---

## 3) Ports: “HTTP is a protocol, why is port 80 reserved?”

Ports identify **services/processes** on a host.

When people say “port 80 is HTTP”, they mean:

- **Servers that speak HTTP traditionally listen on port 80**

It’s a convention (IANA registered default), not a physics law. HTTP can run on any port.

Clients typically use **ephemeral ports** (random-ish high ports) as their source port.

---

## 4) TCP vs UDP: why two major transport protocols exist

### 4.1 TCP (connection-oriented, reliable byte stream)
TCP provides:

- connection setup (handshake)
- reliable delivery (ACKs + retransmission)
- in-order byte stream
- flow control (receiver window)
- congestion control (cwnd)

Best for: web (HTTPS), APIs, files, many databases.

### 4.2 UDP (connectionless datagrams)
UDP provides:

- minimal header
- no handshake
- no built-in reliability, ordering, or congestion control

Best for: real-time audio/video, games, telemetry, and as a substrate for QUIC.

### 4.3 Why live audio/video often uses UDP
TCP can cause **head-of-line blocking**:

- if one segment is lost, later data is held back until retransmission succeeds

Real-time media prefers:

- timely delivery
- tolerate small losses

On-demand video (Netflix/YouTube VOD) often uses TCP because buffering makes retransmissions acceptable.

---

## 5) Reliable data transfer: building reliability over an unreliable network

### 5.1 Imperfections transport must handle
- corruption → detect via checksum
- loss → detect via ACKs + timers
- reordering/duplication → detect via sequence numbers

### 5.2 Checksums
- Sender computes checksum over header+data
- Receiver verifies; if invalid → discard

### 5.3 ACKs + retransmission timers
- Sender starts timer when sending
- If ACK not received before timeout → retransmit

**Why timers alone aren’t enough:**
- ACK might be lost; retransmission could cause duplication.

### 5.4 Sequence numbers
TCP numbers **bytes** in the stream.

- Sequence number field = sequence number of the **first byte** in this segment
- ACK number = **next expected byte**

This lets receiver:
- detect duplicates
- reorder out-of-order data
- infer missing ranges

---

## 6) Sliding window, pipelining, and why stop-and-wait is inefficient

### 6.1 Stop-and-wait
Send one segment → wait for ACK → send next.

Bad throughput on high RTT links because sender is idle most of the RTT.

### 6.2 Sliding window
Sender may have up to **W** unacknowledged segments/bytes in flight.

- As ACKs arrive, the window “slides” forward.

### 6.3 Two classic ARQ strategies

#### Go-Back-N
Receiver:
- accepts only in-order
- discards out-of-order
- sends cumulative ACK for last in-order

Sender:
- one timer for oldest unACKed
- timeout → retransmit all unacknowledged segments in window

Advantage: simple.

#### Selective Repeat
Receiver:
- accepts out-of-order
- buffers them
- ACKs each correctly received segment

Sender:
- retransmits only missing segments

Advantage: saves bandwidth under loss.

**Why SR window ≤ half the sequence space:**
- to avoid ambiguity when sequence numbers wrap around

---

## 7) Three-way handshake: why TCP is connection-oriented

“Connection-oriented” means endpoints keep **shared state**:

- sequence number spaces
- buffers
- timers
- congestion control variables

### 7.1 Handshake steps
1) Client → Server: **SYN**, seq = client_ISN
2) Server → Client: **SYN+ACK**, seq = server_ISN, ack = client_ISN + 1
3) Client → Server: **ACK**, ack = server_ISN + 1

**Why sequence numbers are random:**
- helps prevent spoofing/sequence prediction attacks

**Why 3 steps not 2:**
- server needs proof client received server’s ISN

---

## 8) Congestion: where it happens and who controls it

### 8.1 What congestion is
Congestion occurs when offered load > capacity at a bottleneck.

Physically shows up as:
- router queues growing
- increasing delay
- packet drops when buffers overflow

### 8.2 Traffic bursts
Traffic is bursty; even if average rates look safe, simultaneous bursts can exceed capacity.

### 8.3 Bottleneck link
The path’s throughput is limited by the smallest-capacity link.
That’s where queues form first, so congestion control focuses on not overloading bottlenecks.

### 8.4 Fairness and max-min fairness
Max-min fairness idea:
- you can’t increase one flow without decreasing another with smaller/equal allocation

---

## 9) TCP congestion control basics: cwnd and AIMD

### 9.1 Congestion window (cwnd)
**cwnd** is a sender-side variable limiting how much data can be in flight due to network conditions.

Effective send window is:

- min(cwnd, rwnd, sender buffer constraints)

Where:
- rwnd = receiver advertised window (flow control)

### 9.2 AIMD (Additive Increase Multiplicative Decrease)
- Increase cwnd slowly when no congestion (roughly +1 MSS per RTT)
- On congestion: multiply cwnd by factor < 1 (often halve)

Produces “sawtooth” behavior.

---

## 10) Slow start and severe vs mild congestion

### 10.1 Slow start
Goal: reach a reasonable cwnd quickly.

- cwnd starts small
- cwnd grows exponentially (roughly doubles each RTT)

### 10.2 ssthresh
Slow-start threshold = estimate of last safe cwnd.

- When cwnd reaches ssthresh → switch to congestion avoidance (linear growth)

### 10.3 Severe congestion (timeout)
Timeout implies serious congestion.

- ssthresh = cwnd / 2
- cwnd reset to 1 MSS
- slow start again up to ssthresh, then linear

### 10.4 Mild congestion (3 duplicate ACKs)
Duplicate ACKs imply only one segment likely lost.

- fast retransmit missing segment
- ssthresh = cwnd / 2
- cwnd set to around ssthresh
- enter congestion avoidance (no full reset)

---

## 11) RTT, bandwidth, throughput, and window scaling

### 11.1 Definitions
- RTT: time for data to go there and ACK to return
- Bandwidth: capacity (bits/sec)
- Throughput: actual delivered rate

### 11.2 Why small windows hurt throughput
Approx throughput upper bound:

- throughput ≈ window / RTT

If RTT is large or bandwidth is large, you need a large window to keep the “pipe” full.

### 11.3 Bandwidth-delay product (BDP)
BDP = bandwidth × RTT = bytes needed in flight to fully utilize link.

If window < BDP → underutilization.

### 11.4 Window scaling
TCP window field is 16 bits (max 65,535). Window scaling (RFC 1323/7323 updates) allows larger effective windows via a scaling factor S negotiated during handshake:

- effective_window = window_field × 2^S

---

## 12) Nagle’s algorithm and delayed ACK interaction

### 12.1 The small packet problem
Sending tiny segments wastes bandwidth due to header overhead.

### 12.2 Nagle’s algorithm (idea)
- If there is **unacknowledged data**, buffer small writes until ACK arrives or you have MSS to send
- If there is **no unacknowledged data**, send immediately

### 12.3 Why it can add latency
With **delayed ACKs**, receiver waits briefly before ACK.

Nagle waits for ACK to send more small data.
Together → extra delay/lag.

Latency-sensitive apps disable Nagle via **TCP_NODELAY**.

---

## 13) Measuring RTT with ping (and what “hops” means)

- `ping` measures RTT using ICMP echo request/reply.
- RTT is time, not hop count.

### TTL and hops
- TTL is decremented by 1 at each router.
- Each router crossing is a “hop”.
- If TTL reaches 0, packet is dropped to prevent infinite loops.

---

# 14) TCP Header Fields (Detailed)

TCP header size: **20–60 bytes**.

## 14.1 Source Port (16 bits)
- identifies sending process’s socket port.

## 14.2 Destination Port (16 bits)
- identifies receiving process’s socket port.

## 14.3 Sequence Number (32 bits)
- byte-stream numbering.
- contains sequence number of **first data byte** in this segment.
- SYN and FIN each consume one sequence number.

## 14.4 Acknowledgment Number (32 bits)
- valid when ACK flag set.
- equals **next expected byte**.

Example:
- seq = 42849, payload = 59 bytes
- next expected = 42849 + 59 = 42908
- receiver ACKs 42908

## 14.5 Data Offset / Header Length (4 bits)
- indicates where data begins.
- stored as number of 32-bit (4-byte) words.

So:
- minimum 20 bytes → 20/4 = 5
- maximum 60 bytes → 60/4 = 15

## 14.6 Reserved (bits)
- reserved for future use (must be 0 in many specs)

## 14.7 Flags (control bits)
Common flags:

- **SYN**: start connection
- **ACK**: acknowledgment field valid
- **FIN**: graceful close
- **RST**: abort/reset connection
- **PSH**: push data to app promptly
- **URG**: urgent pointer valid
- **ECE/ECN**: explicit congestion notification echo
- **CWR**: congestion window reduced

Bit-pattern example:
- simplified last-bit-only `0001` corresponds to **FIN** in common ordering.

## 14.8 Window Size (16 bits)
- receiver-advertised receive buffer space (flow control).
- sender should keep unacknowledged data ≤ rwnd.

With window scaling, effective rwnd can be much larger.

## 14.9 Checksum (16 bits)
- mandatory in TCP.
- covers header + data (and pseudo-header in typical implementations).
- detects corruption; receiver discards bad segments.

## 14.10 Urgent Pointer (16 bits)
- meaningful only if URG flag set.
- points to end of urgent data within stream.
- rarely used in modern apps.

## 14.11 Options (0–40 bytes) and Padding
Options extend TCP. Padding aligns header length to 4-byte multiples.

Common options:

### MSS
- maximum segment size host can receive.
- helps avoid IP fragmentation.

### Window Scale
- negotiates scale factor S.
- enables large windows on high BDP paths.

### Timestamps
- better RTT measurement
- helps with sequence wrap/old segment detection

(Another important real-world option: SACK, selective acknowledgment, often used with modern TCP.)

---

# 15) Quick worked mini-examples (from our discussion)

## 15.1 Sequence/ACK arithmetic
- If seq = 255 and payload = 50 → next seq = 305
- If seq = 2503 and payload = 50 → receiver ACK = 2553

## 15.2 Header length
- no options → header length field = 5 (20 bytes / 4)

## 15.3 TCP server handling many clients
- TCP is point-to-point per connection.
- server can maintain many connections because each one is uniquely identified by the 4‑tuple.

---

# 16) What to keep in your head (the “sticky” version)

- IP is best-effort; TCP builds reliability on top.
- TCP numbers **bytes**, ACK is **next expected byte**.
- Sliding windows enable pipelining.
- Go-Back-N is simple but wasteful; Selective Repeat is efficient but more complex.
- Congestion happens in router queues; TCP controls sending with cwnd.
- Small windows limit throughput on high RTT/high bandwidth links; window scaling fixes that.
- Nagle reduces tiny packet overhead but can add latency with delayed ACKs.

---

# 17) Suggested mini-projects to make this real

1) **Mini reliable transport over UDP**: implement seq numbers + ACK + timeout retransmit.
2) **Packet loss simulator**: randomly drop packets and compare go-back-n vs selective repeat.
3) **TCP lab**: run a local client/server, log RTT and throughput; toggle `TCP_NODELAY`.
4) **BDP calculator**: given bandwidth & ping RTT, compute required window size.

