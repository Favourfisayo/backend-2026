# DNS Resolver — Code Walkthrough & Application Layer Context

## What This Tool Does

`dns-resolver.js` is a Node.js CLI tool that takes any hostname and queries **every common DNS record type** against it, then prints a formatted report. It uses Node's built-in `dns` module — no third-party packages needed.

```
node dns-resolver.js google.com
node dns-resolver.js github.com
node dns-resolver.js example.org
```

---

## How DNS Fits into the Application Layer

The **Application Layer** (Layer 7 in the OSI model / the top layer in TCP/IP) is where user-facing protocols live — HTTP, HTTPS, SMTP, FTP, SSH, and **DNS**.

DNS (Domain Name System) is the **phone book of the internet**. Before any application can open a TCP connection it needs an IP address, and DNS is the system that turns a human-readable name (`github.com`) into a routable address (`140.82.114.4`). Every HTTP request, every email, every API call starts with a DNS lookup.

```
Browser types "github.com"
        │
        ▼
┌───────────────────┐
│  Application Layer│  ← DNS lives here (port 53, UDP/TCP)
│  DNS Query        │
└───────────────────┘
        │  resolved IP
        ▼
┌───────────────────┐
│  Transport Layer  │  TCP/UDP
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Network Layer    │  IP routing
└───────────────────┘
```

DNS itself uses **UDP port 53** for standard queries (fast, single packet) and falls back to **TCP port 53** for large responses (zone transfers or large TXT/DNSSEC records).

---

## DNS Resolution Flow (Step by Step)

```
Client App
   │
   ├─1─▶  OS resolver cache / /etc/hosts          (instant, local)
   │
   ├─2─▶  Recursive Resolver (your ISP or 8.8.8.8) (cache hit → fast)
   │
   ├─3─▶  Root Name Server (.)                     (knows TLD servers)
   │
   ├─4─▶  TLD Name Server (.com, .org …)            (knows authoritative NS)
   │
   └─5─▶  Authoritative Name Server                 (returns actual record)
```

Node.js exposes **both levels** of this:

| Function | What it does |
|---|---|
| `dns.lookup()` | Asks the **OS** — respects `/etc/hosts`, local cache, VPN overrides |
| `dns.resolve4()` / `dns.resolveMx()` etc. | Sends queries directly to the **network's DNS resolver**, bypassing the OS cache |

The tool uses both so you can see the difference.

---

## Record Types — Reference Table

| Record | Full Name | What it stores | Used for |
|--------|-----------|----------------|----------|
| **A** | Address | IPv4 address | Resolving a domain to an IPv4 host |
| **AAAA** | IPv6 Address | IPv6 address | Same, for IPv6 |
| **CNAME** | Canonical Name | Alias → real hostname | CDN aliases, `www` → apex domain |
| **MX** | Mail Exchange | Mail server + priority | Routing email for a domain |
| **NS** | Name Server | Authoritative DNS servers | Delegating a zone to DNS servers |
| **TXT** | Text | Arbitrary text | SPF, DKIM, DMARC, domain verification |
| **SOA** | Start of Authority | Zone metadata | Serial number, refresh intervals, admin contact |
| **SRV** | Service | host + port + priority/weight | Service discovery (SIP, XMPP, Kubernetes) |
| **PTR** | Pointer | IP → hostname | Reverse DNS, spam filtering, logging |
| **NAPTR** | Naming Authority Pointer | Regex rewrite rules | VoIP / SIP routing |
| **CAA** | Cert Authority Authorization | Allowed CAs | Restricting who can issue TLS certs |

---

## Code Walkthrough

### 1. Input Validation

```js
const HOSTNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
if (!HOSTNAME_REGEX.test(target)) { ... }
```

Rejects anything that isn't a valid hostname character. This is a security boundary — the input comes from the command line (untrusted), and we don't want arbitrary strings passed into DNS calls.

---

### 2. `safeLookup` Wrapper

```js
async function safeLookup(fn) {
  try {
    return await fn();
  } catch (err) {
    const noRecord = ["ENODATA", "ENOTFOUND", "ESERVFAIL", "ETIMEOUT"];
    if (noRecord.includes(err.code)) return null;
    throw err;
  }
}
```

DNS is **not an error** when a record type simply doesn't exist for a domain — it returns `ENODATA`. This wrapper filters out "no record" responses and returns `null` so the display layer can print `(none)` gracefully, while still re-throwing genuinely unexpected errors.

---

### 3. Record Lookups

Each `dns.resolveXxx()` call is a separate UDP query to your DNS resolver:

```js
const a    = await safeLookup(() => dns.resolve4(hostname, { ttl: true }));
const aaaa = await safeLookup(() => dns.resolve6(hostname, { ttl: true }));
const mx   = await safeLookup(() => dns.resolveMx(hostname));
// ... and so on
```

`{ ttl: true }` on A/AAAA records tells the API to include the **TTL** (Time To Live) — how many seconds until this record expires from cache. This is an important tuning knob in the application layer:
- Low TTL (60s) → faster failover, more DNS traffic
- High TTL (86400s) → fewer lookups, slower propagation of changes

---

### 4. OS-Level Lookup vs Network Lookup

```js
// Network query (bypasses OS cache):
const a = await dns.resolve4(hostname, { ttl: true });

// OS-level query (respects /etc/hosts, VPN, local cache):
const looked = await dns.lookup(hostname, { all: true });
```

These can return **different answers** — for example, if you have a custom `/etc/hosts` entry for `api.myapp.dev`, `dns.lookup` returns your local override but `dns.resolve4` returns the real public IP.

---

### 5. Reverse DNS

```js
const reverse = await safeLookup(() => dns.reverse(ip));
```

Given an IP, asks for the PTR record — the **reverse mapping**. This is used by:
- Mail servers to verify that a sending IP has a valid reverse entry (anti-spam)
- System logs and monitoring tools to display hostnames instead of IPs
- Network intrusion detection

---

### 6. System DNS Servers

```js
dns.getServers()
```

Reads the resolver configuration from the OS (`/etc/resolv.conf` on Linux/macOS, registry on Windows). This tells you which upstream resolver your Node process will use — e.g., `8.8.8.8` (Google), `1.1.1.1` (Cloudflare), or a private corporate resolver.

---

## Why This Matters at the Application Layer

1. **Every network call starts with DNS.** Even `fetch("https://api.example.com/data")` internally does a DNS lookup before a TCP connection is opened.

2. **TTL drives caching.** Slow TTLs = more latency on first connection; stale records = broken connections. Application developers must design around DNS caching.

3. **Service discovery via SRV records.** Microservices and databases (Kubernetes, MongoDB clusters, SIP servers) use SRV records to advertise their host + port without hardcoding IPs.

4. **Email infrastructure is pure DNS.** MX + SPF (TXT) + DKIM (TXT) + DMARC (TXT) + CAA all live in DNS. A misconfigured TXT record causes email to be rejected or dropped.

5. **Security via DNS.** CAA records stop unauthorized CAs from issuing a TLS certificate for your domain — a simple DNS record that closes a significant attack vector.

---

## Quick Reference — Running the Tool

```bash
# Resolve a popular domain
node dns-resolver.js google.com

# Check a mail-heavy domain (good for MX/TXT/SPF)
node dns-resolver.js gmail.com

# Check a service with SRV records
node dns-resolver.js _xmpp-client._tcp.jabber.org

# Check a CDN domain (good for CNAME)
node dns-resolver.js docs.github.com
```

---

## Dependencies

None. The tool uses only:
- `dns` — built-in Node.js module (available since Node 0.1)
- `process` — built-in (CLI args, exit codes)

Requires **Node.js v12+** for `dns.promises` and `dns.resolveCaa()`.
