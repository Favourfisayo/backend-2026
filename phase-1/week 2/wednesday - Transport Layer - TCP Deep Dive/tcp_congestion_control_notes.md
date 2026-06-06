# TCP Congestion Control Notes (Deep + Clear)

> This doc focuses **only** on congestion control topics we discussed: what congestion is, where it occurs, bottlenecks, bandwidth allocation ideas, cwnd, AIMD, slow start, mild vs severe congestion, and the related performance concepts (RTT, throughput, windows).

---

## 1) What congestion is (and what it is not)

### 1.1 Definition
**Congestion** happens when the amount of traffic offered to a network resource (usually a link/router output port) exceeds what it can forward.

What you see physically:
- Router output **queues** grow
- **Queueing delay** rises (packets wait)
- Eventually buffers fill → packets are **dropped**

### 1.2 Congestion does NOT require “hitting max capacity”
A common misconception is: "congestion only starts at 100% link capacity." In reality:

- Congestion starts as soon as packets begin accumulating in queues.
- Because traffic is **bursty**, queues can form even when the *average* rate is below capacity.

### 1.3 Key mental split
- **RTT/latency**: how long it takes for a packet to go and come back.
- **Throughput**: how much useful data you deliver per second.

Small windows don’t usually increase RTT itself — they reduce **throughput** by forcing the sender to sit idle during RTT.

---

## 2) Why routers have queues

Routers forward packets from many incoming links to fewer outgoing links. If packets arrive at an output faster than that output can transmit, they must wait.

Queue = the waiting line.

Queues help absorb short bursts. But sustained overload creates long delay and drops.

---

## 3) Bottleneck links (why congestion control focuses there)

A path has many links. The **bottleneck** is the lowest-capacity (or most-contended) link along the path.

- End-to-end throughput is limited by the bottleneck.
- Congestion (queues, drops) typically appears first at the bottleneck.

So congestion control aims to keep the **sum of sending rates** across the bottleneck from persistently exceeding the bottleneck capacity.

---

## 4) Bursty traffic (why equal sharing is hard)

Even if a link is 200 Mbps and you have 4 hosts:

- Naively you’d say: “50 Mbps each.”
- In reality, traffic comes in **bursts**, not a perfectly smooth stream.

If multiple hosts burst at the same time, they can exceed 200 Mbps momentarily → queue buildup → loss.

This is why “divide bandwidth equally” is not straightforward in practice.

---

## 5) Bandwidth allocation principles: efficiency, fairness, convergence

### 5.1 Avoid congestion
Keep the network stable:
- Long-term average offered load should not exceed bottleneck capacity.

### 5.2 Efficiency
Use the expensive bottleneck well:
- Total rate should be close to the bottleneck capacity (but not so high that queues explode).

### 5.3 Fairness (max-min fairness idea)
An allocation is **max-min fair** if you cannot increase one flow without decreasing another flow that already has an equal or smaller allocation.

Practical note:
- Perfect max-min fairness is an ideal goal; real networks are complex (many flows, multiple bottlenecks).
- TCP often approximates fairness **per connection/flow**, not per host.

### 5.4 Convergence
Good congestion control should:
- settle toward a stable, fair-ish operating point
- adapt when flows start/stop
- avoid wild oscillations

---

## 6) TCP’s control lever: the congestion window (cwnd)

### 6.1 What cwnd is
**cwnd** is a sender-side variable that limits how much data can be "in flight" (sent but not yet ACKed) due to network congestion concerns.

- It is **not** a field in the TCP header.
- It lives in the sender’s TCP control block (TCB).

### 6.2 Flow control vs congestion control
TCP uses two main windows:

- **rwnd (receiver window)**: advertised by receiver (protects receiver buffers)
- **cwnd (congestion window)**: maintained by sender (protects the network)

Effective sending limit is approximately:

> **send_window = min(cwnd, rwnd)**

(Plus practical constraints like sender buffering and app behavior.)

### 6.3 Rate intuition
A classic approximation:

> **throughput ≈ cwnd / RTT**

So increasing cwnd increases throughput, and decreasing cwnd reduces throughput.

---

## 7) AIMD (Additive Increase, Multiplicative Decrease)

AIMD is the core idea behind classic TCP congestion avoidance.

### 7.1 Additive Increase
When the network appears uncongested:
- cwnd increases slowly, roughly **+1 MSS per RTT** (linear growth).

Why linear?
- It probes capacity cautiously and reduces the chance that many flows overshoot badly together.

### 7.2 Multiplicative Decrease
When congestion is detected:
- cwnd is reduced by a multiplicative factor (commonly **halve**).

Why multiplicative?
- A small reduction may not relieve congestion.
- A big cut quickly drains queues and stabilizes the network.

### 7.3 Sawtooth pattern
Because cwnd grows linearly and drops sharply, cwnd vs time forms a “sawtooth.”

### 7.4 Why AIMD helps fairness
When multiple TCP flows share a bottleneck, AIMD tends to:
- move them toward a balanced share over time
- because both increase similarly and both back off on congestion

---

## 8) Why slow start exists

AIMD’s linear increase is too slow when starting from cwnd = 1 MSS.

**Slow start** is used to quickly discover a reasonable operating region.

---

## 9) Slow start (exponential growth)

### 9.1 How it grows
During slow start:
- cwnd grows roughly **exponentially** (often described as doubling every RTT).

Intuition:
- each ACK increases cwnd by ~1 MSS
- more cwnd → more packets per RTT → more ACKs → faster growth

### 9.2 ssthresh (slow start threshold)
TCP maintains **ssthresh**:
- an estimate of the last cwnd that did not cause congestion

Behavior:
- if cwnd < ssthresh → slow start (fast growth)
- once cwnd ≥ ssthresh → congestion avoidance (AIMD linear growth)

ssthresh is updated after congestion events.

---

## 10) Mild vs severe congestion signals

TCP reacts differently depending on how congestion is detected.

### 10.1 Severe congestion: timeout
If the retransmission timer expires:
- implies ACKs aren’t coming back (could be heavy congestion)

Typical reaction:
- **ssthresh = cwnd / 2**
- **cwnd = 1 MSS**
- return to slow start until reaching ssthresh, then linear growth

This is a “hard reset.”

### 10.2 Mild congestion: 3 duplicate ACKs
If 3 duplicate ACKs arrive:
- suggests one segment was lost but later segments are still arriving

Typical reaction:
- **fast retransmit** the missing segment immediately (no waiting for timeout)
- **ssthresh = cwnd / 2**
- reduce cwnd to around ssthresh
- enter congestion avoidance (linear growth) without restarting from 1

This is a “soft backoff.”

---

## 11) Congestion happens before maximum capacity (threshold idea)

As sending rate increases:
- useful throughput rises at first
- delay rises slowly at first

Near the bottleneck limit:
- queues grow rapidly
- delay can spike sharply

Eventually:
- drops increase
- retransmissions waste bandwidth
- useful throughput can *fall* even if sending rate increases

This is why there is a "sweet spot" just below overload.

---

## 12) Congestion collapse (the nightmare)

Congestion collapse can happen when:
- many senders transmit aggressively
- packets are dropped heavily
- retransmissions consume most of the bandwidth

Result:
- lots of traffic sent
- little useful traffic delivered

Classic cause mentioned:
- spurious retransmissions (timeouts triggered by delay rather than true loss)

---

## 13) Practical mental model

Think of a bottleneck link like a checkout counter:
- checkout speed = link capacity
- customers arriving = packets
- queue length = buffer occupancy

AIMD:
- slowly add customers (increase cwnd)
- if line gets out of hand (loss/timeout), cut your arrival rate fast (halve/reset)

---

## 14) Key takeaways to memorize

- Congestion shows up as router queues, delay, drops.
- It can begin before “full capacity” because traffic is bursty.
- Bottlenecks determine throughput.
- TCP controls sending rate via **cwnd**.
- Effective send limit ≈ **min(cwnd, rwnd)**.
- AIMD: linear increase, multiplicative decrease → sawtooth.
- Slow start gets you to a usable cwnd quickly.
- Timeout = severe → reset cwnd to 1.
- 3 dup ACKs = mild → fast retransmit + halve cwnd.

---

## 15) Mini-project ideas (to make it real)

1) **Cwnd simulator**: simulate cwnd over time with random loss; plot sawtooth.
2) **Two-flow fairness sim**: run two AIMD flows sharing a bottleneck; watch convergence.
3) **Ping + BDP calculator**: use ping RTT and known bandwidth to estimate needed cwnd/rwnd.

