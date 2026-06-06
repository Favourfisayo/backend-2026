# Decision Tree: Picking the Right Access Network (and Why)

This guide helps you choose an access network based on **constraints** (availability, cost, mobility, latency, reliability) and **use case** (home, office, remote site, backup).

> Mental model: you’re always trading between **speed**, **latency/jitter**, **reliability**, **mobility**, **time-to-deploy**, and **cost**.

---

## 0) Quick definitions (so the tree stays clear)

- **Access network**: the segment that connects your end system (or local network) into a larger provider network.
- **Last mile**: the physical reach from provider equipment to the customer location/device.
- **Guided**: wired (twisted pair, coax, fiber). Usually more predictable.
- **Unguided**: wireless (Wi‑Fi, cellular, microwave, satellite, FSO). Faster to deploy, more variable.

---

## 1) The Decision Tree (start here)

### Step 1: Are you fixed-location or do you need mobility?

**A) I need mobility (moving around, phone-first, temporary location)**
- **Pick: Cellular (4G/5G)**
  - **Why:** designed for moving devices + wide coverage.
  - **Best for:** phones, hotspots, travel, pop-up work sites.
  - **Watch-outs:** variable speed/latency, data caps, tower congestion.

**B) Fixed location (home/office/building/site)**
- Go to Step 2.

---

### Step 2: Can you get fiber (FTTH) to this location?

**A) Yes, fiber is available and affordable**
- **Pick: FTTH (Fiber to the Home/Building)**
  - **Why:** best combo of throughput + low jitter + long-term stability.
  - **Best for:** remote work, content creation, cloud/dev workflows, households with many users, businesses.
  - **Watch-outs:** install time/cost; local provider quality still matters.

**B) No fiber (or it’s too expensive / takes too long)**
- Go to Step 3.

---

### Step 3: Do you have coax (cable TV internet / DOCSIS) available?

**A) Yes, cable internet is available**
- **Pick: Cable Internet (DOCSIS over coax)**
  - **Why:** high download speeds using existing TV coax.
  - **Best for:** streaming-heavy households, typical home broadband.
  - **Watch-outs:** neighborhood congestion (shared medium) can increase jitter at peak hours; uploads may be weaker.

**B) No coax cable internet**
- Go to Step 4.

---

### Step 4: Do you have a usable telephone line for DSL?

**A) Yes, DSL is available and the distance/line quality is decent**
- **Pick: DSL (ADSL/VDSL)**
  - **Why:** leverages existing phone copper; can be stable enough for basic broadband.
  - **Best for:** areas without fiber/cable; moderate usage (browsing, video calls depending on quality).
  - **Watch-outs:** speed drops with distance and copper noise; may struggle with high-demand households.

**B) No DSL (or it’s too slow/unstable)**
- Go to Step 5.

---

### Step 5: Do you need service in a remote/rural place with limited terrestrial infrastructure?

**A) Yes, remote/rural (no reliable wired options)**
- Go to Step 6.

**B) Not remote, but wired options are blocked (permits, digging, landlord restrictions, time pressure)**
- Go to Step 7.

---

### Step 6: Remote area options (coverage-first)

**A) You can get LEO satellite (e.g., Starlink) and can mount the terminal with a clear sky view**
- **Pick: LEO Satellite Internet**
  - **Why:** real two-way internet in places where cables don’t exist.
  - **Best for:** rural homes, remote work sites, boats/camp-style setups.
  - **Watch-outs:** cost, weather sensitivity, variable performance under load.

**B) Only GEO satellite is available**
- **Pick: GEO Satellite Internet (last resort for interactive apps)**
  - **Why:** coverage where nothing else works.
  - **Best for:** basic browsing, email, non-real-time needs.
  - **Watch-outs:** very high latency (painful for gaming, some video calls, interactive development workflows).

---

### Step 7: “I can’t trench fiber, but I need serious bandwidth”

**A) You have line-of-sight to another building/site that *does* have good internet**
- Go to Step 8.

**B) No line-of-sight option**
- **Pick: Cellular 4G/5G (primary or backup)**
  - **Why:** quickest deploy without digging.
  - **Best for:** apartments, temporary offices.
  - **Watch-outs:** variability, data caps.

---

### Step 8: Line-of-sight bridging options

**A) You want high reliability and can install a directional radio link**
- **Pick: Microwave Point-to-Point**
  - **Why:** strong backhaul option; can be low latency; no trenching.
  - **Best for:** linking offices/buildings, rural backhaul.
  - **Watch-outs:** needs careful alignment and clear path; some weather impact.

**B) You want “fiber-like speed” and the environment is suitable (low fog/dust) + short range**
- **Pick: Free-Space Optics (FSO)**
  - **Why:** optical link through air can reach very high bandwidth with very low latency.
  - **Best for:** campus/building-to-building links where permits are slow.
  - **Watch-outs:** fog is the villain; alignment sensitivity.

---

## 2) Scenario-based recommendations (cheat sheet)

### Home internet (normal city/urban)
- **Best:** FTTH
- **If no fiber:** Cable (DOCSIS)
- **If no cable:** DSL (if decent), otherwise Cellular

**Why:** home usage is bursty and multi-user; you want stability and low jitter for calls/gaming.

### Student / developer workflow (Zoom + Git pulls + cloud dev + uploads)
- **Best:** FTTH
- **Second:** Cable (if not congested) + strong router/Wi‑Fi
- **Backup:** Cellular hotspot for outages

**Why:** you care about jitter (calls), upload (push/pull artifacts), and reliability.

### Office / small business
- **Best:** FTTH (or business-grade fiber)
- **Add:** a **cellular backup** (failover)

**Why:** downtime costs money; redundancy matters.

### Cafe / shared public space internet
- **Best:** wired backhaul (fiber/cable) + well-designed Wi‑Fi

**Why:** Wi‑Fi is shared airtime; you need strong backhaul and good AP placement to avoid congestion.

### Temporary site (event, pop-up store, construction)
- **Best:** Cellular 4G/5G
- **If line-of-sight to a stable site:** Microwave P2P

**Why:** speed of deployment beats absolute peak performance.

### Rural / hard-to-reach
- **Best:** LEO satellite
- **If possible:** Microwave backhaul from a connected town

**Why:** coverage-first. Fiber trenching is often impractical.

### Ultra-low-latency requirements (competitive gaming, trading-like apps, real-time control)
- **Best:** Wired Ethernet to router + FTTH
- **Avoid as primary:** GEO satellite; congested Wi‑Fi

**Why:** jitter is the real enemy more than average latency.

---

## 3) How to choose when multiple options exist (tie-breakers)

Use these tie-breakers in order:

1) **Availability & install time** (can you get it *this month*?)
2) **Reliability/jitter** (video calls, gaming, realtime collaboration)
3) **Upload needs** (cloud backups, pushing builds, creator workflows)
4) **Total cost** (monthly + hardware + install)
5) **Redundancy** (do you need a backup link?)

---

## 4) A practical “best practice” default setup

If you have the budget and you care about reliability:

- **Primary:** FTTH (or cable if fiber isn’t available)
- **Local:** Ethernet for your main workstation (or high-quality Wi‑Fi)
- **Backup:** 4G/5G hotspot/router

This combo covers the two biggest failure modes:
- wired outage/provider issue
- local Wi‑Fi issues

---

## 5) Mini project: build your own decision tool

Make a tiny decision helper as a script or Notion checklist:

Inputs:
- location fixed vs mobile
- fiber/cable/dsl availability
- line-of-sight option
- budget
- latency sensitivity (low/medium/high)
- throughput need (low/medium/high)

Output:
- recommended access network + backup
- short “why” explanation

This turns the theory into something you can reuse (and brag about in interviews).