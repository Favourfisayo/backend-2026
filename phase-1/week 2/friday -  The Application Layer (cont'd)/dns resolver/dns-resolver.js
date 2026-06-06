/**
 * dns-resolver.js
 * A simple DNS lookup tool that queries all common record types
 * using Node.js's built-in `dns` module.
 *
 * Usage:
 *   node dns-resolver.js <hostname>
 *   node dns-resolver.js google.com
 */

const dns = require("dns").promises;

const target = process.argv[2];

if (!target) {
  console.error("Usage: node dns-resolver.js <hostname>");
  process.exit(1);
}

// Validate hostname: only allow safe characters to prevent injection
const HOSTNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
if (!HOSTNAME_REGEX.test(target)) {
  console.error("Invalid hostname. Only alphanumeric characters, dots, hyphens, and underscores are allowed.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: run a lookup, suppress ENODATA / ENOTFOUND (record doesn't exist),
// but re-throw real errors so the caller knows something went wrong.
// ─────────────────────────────────────────────────────────────────────────────
async function safeLookup(fn) {
  try {
    return await fn();
  } catch (err) {
    const noRecord = ["ENODATA", "ENOTFOUND", "ESERVFAIL", "ETIMEOUT"];
    if (noRecord.includes(err.code)) return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty-print a section
// ─────────────────────────────────────────────────────────────────────────────
function section(type, data) {
  console.log(`\n┌─── ${type} Records ${"─".repeat(Math.max(0, 50 - type.length - 9))}`);
  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log("│  (none)");
  } else {
    const items = Array.isArray(data) ? data : [data];
    items.forEach((item) => {
      const value = typeof item === "object" ? JSON.stringify(item, null, 2).replace(/\n/g, "\n│    ") : item;
      console.log(`│  ${value}`);
    });
  }
  console.log("└" + "─".repeat(54));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main resolver
// ─────────────────────────────────────────────────────────────────────────────
async function resolve(hostname) {
  console.log(`\n${"═".repeat(56)}`);
  console.log(`  DNS Resolution Report for: ${hostname}`);
  console.log(`  Date: ${new Date().toUTCString()}`);
  console.log(`${"═".repeat(56)}`);

  // A — IPv4 address(es)
  const a = await safeLookup(() => dns.resolve4(hostname, { ttl: true }));
  section(
    "A (IPv4)",
    a ? a.map((r) => `${r.address}  [TTL: ${r.ttl}s]`) : null
  );

  // AAAA — IPv6 address(es)
  const aaaa = await safeLookup(() => dns.resolve6(hostname, { ttl: true }));
  section(
    "AAAA (IPv6)",
    aaaa ? aaaa.map((r) => `${r.address}  [TTL: ${r.ttl}s]`) : null
  );

  // CNAME — canonical name
  const cname = await safeLookup(() => dns.resolveCname(hostname));
  section("CNAME", cname);

  // MX — mail exchange
  const mx = await safeLookup(() => dns.resolveMx(hostname));
  section(
    "MX (Mail Exchange)",
    mx ? mx.map((r) => `priority=${r.priority}  exchange=${r.exchange}`) : null
  );

  // NS — name servers
  const ns = await safeLookup(() => dns.resolveNs(hostname));
  section("NS (Name Servers)", ns);

  // TXT — text records (SPF, DKIM, verification tokens, etc.)
  const txt = await safeLookup(() => dns.resolveTxt(hostname));
  section("TXT", txt ? txt.map((chunks) => chunks.join("")) : null);

  // SOA — start of authority
  const soa = await safeLookup(() => dns.resolveSoa(hostname));
  section("SOA (Start of Authority)", soa);

  // SRV — service location records
  const srv = await safeLookup(() => dns.resolveSrv(hostname));
  section(
    "SRV (Service)",
    srv
      ? srv.map(
          (r) =>
            `priority=${r.priority} weight=${r.weight} port=${r.port} target=${r.name}`
        )
      : null
  );

  // PTR — pointer / reverse DNS
  const ptr = await safeLookup(() => dns.resolvePtr(hostname));
  section("PTR (Reverse DNS)", ptr);

  // NAPTR — naming authority pointer (used in VoIP / SIP)
  const naptr = await safeLookup(() => dns.resolveNaptr(hostname));
  section("NAPTR", naptr);

  // CAA — certification authority authorization
  const caa = await safeLookup(() => dns.resolveCaa(hostname));
  section(
    "CAA (Cert Authority)",
    caa ? caa.map((r) => `${r.critical ? "critical " : ""}${r.issue || r.issuewild || r.iodef}`) : null
  );

  // --- dns.lookup(): OS-level resolution (uses /etc/hosts, local cache) ------
  console.log("\n┌─── OS-level lookup (dns.lookup) ─────────────────────");
  try {
    const looked = await dns.lookup(hostname, { all: true });
    looked.forEach((r) => console.log(`│  ${r.address}  (family: IPv${r.family})`));
  } catch (err) {
    console.log(`│  Error: ${err.message}`);
  }
  console.log("└" + "─".repeat(54));

  // --- Reverse lookup on first A record ------------------------------------
  if (a && a.length > 0) {
    const ip = a[0].address;
    const reverse = await safeLookup(() => dns.reverse(ip));
    console.log(`\n┌─── Reverse lookup for ${ip} ${"─".repeat(Math.max(0, 28 - ip.length))}`);
    if (reverse) {
      reverse.forEach((r) => console.log(`│  ${r}`));
    } else {
      console.log("│  (none)");
    }
    console.log("└" + "─".repeat(54));
  }

  // --- Active DNS servers used by this machine ----------------------------
  console.log("\n┌─── System DNS Servers ────────────────────────────────");
  dns.getServers().forEach((s) => console.log(`│  ${s}`));
  console.log("└" + "─".repeat(54));

  console.log("\n");
}

resolve(target).catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
