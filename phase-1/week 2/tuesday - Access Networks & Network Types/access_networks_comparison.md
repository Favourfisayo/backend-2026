# Access Networks Comparison (Guided vs Unguided)

This note compares common access technologies by **medium**, **performance**, **sharing model**, and **typical use cases**.

> Quick legend:
> - **Guided** = signal is confined to a cable (copper/coax/fiber)
> - **Unguided** = signal travels through air/space (radio/light)
> - **Shared** = users contend for a common medium (congestion/jitter can rise)
> - **Dedicated** = your link is mostly yours end-to-end (more predictable)

## Comparison Table

| Tech | Guided / Unguided | Physical medium | Typical “last‑mile” reach | Typical throughput (rough) | Latency & jitter (rough) | Shared vs dedicated | Key pros | Key cons | Common use cases | Notes / keywords |
|---|---|---|---|---|---|---|---|---|---|---|
| **Dial‑up** | Guided | Telephone copper (voice band) | To telco exchange | ~10–56 kbps | High latency, high jitter | Dedicated call, but tiny bandwidth | Works on legacy phone lines, simple | Ties up voice line, extremely slow | Legacy connectivity | *“Dials” a call; modem uses audio tones* |
| **DSL (ADSL/VDSL)** | Guided | Telephone copper pair | Short–medium; degrades with distance | ~10s–100s Mbps (distance dependent) | Low–moderate latency; moderate jitter under noise | Mostly dedicated to DSLAM, limited by line quality | Uses existing phone wiring; can do voice + data simultaneously | Speed drops with distance/noise; copper limits | Home broadband where fiber isn’t available | *Frequency split (voice low, data high); DSLAM* |
| **Cable Internet (DOCSIS)** | Guided | Coax (TV cable) | Neighborhood node → provider | ~100s Mbps–1+ Gbps (plan dependent) | Low–moderate latency; jitter rises when busy | **Shared** in neighborhood segment | High throughput on existing coax; widely deployed | Congestion at peak times; shared medium | Home broadband | *DOCSIS, CMTS, “node”* |
| **FTTH (Fiber to the Home)** | Guided | Fiber optic | Long; low loss | ~1–10+ Gbps (plan dependent) | Very low latency, low jitter | Often shared PON last‑mile, but very high capacity | Fast, stable, future‑proof; immune to EMI | Install cost/availability | Premium home broadband; enterprise access | *PON/GPON/XGS‑PON, OLT/ONT* |
| **Ethernet (wired LAN)** | Guided | Twisted pair copper (Cat5e/6/6A) or fiber | Room/building/campus | 100 Mbps–10+ Gbps (link dependent) | Very low latency, very low jitter | Typically **dedicated per port** (switched) | Predictable, stable, low cost per device | Requires cabling; limited mobility | Offices, homes, data centers | *Switches, full‑duplex, low loss* |
| **Wi‑Fi (802.11)** | Unguided | Radio (2.4/5/6 GHz, etc.) | Tens of meters per AP | 10s Mbps–1+ Gbps (real‑world varies) | Low–moderate latency; jitter can spike | **Shared** (contended airtime) | Mobility, easy deployment, cheap | Interference, walls, congestion, variable performance | Homes, cafes, offices, campuses | *CSMA/CA, channels, AP, RSSI* |
| **Cellular (4G/5G)** | Unguided | Radio + tower infrastructure | Kilometers per cell | 10s Mbps–1+ Gbps (depends on signal/load) | Moderate latency; jitter varies with load/scheduling | **Shared** (scheduled radio resources) | Wide coverage, mobility, fast to deploy | Variable performance; costs; indoor penetration | Mobile internet; backup WAN | *RAN, base station, scheduling, handover* |
| **Microwave Point‑to‑Point** | Unguided | Directional radio (line‑of‑sight) | km–tens of km | 100s Mbps–multi‑Gbps (equipment dependent) | Low latency; relatively stable if aligned | Dedicated link between two sites | Fast to deploy without trenching; good backhaul | Needs clear line‑of‑sight; weather can matter | Tower/building backhaul, rural links | *LOS, alignment, dish antennas* |
| **Satellite Internet (LEO e.g., Starlink)** | Unguided | Radio via low‑earth satellites | Global coverage | 10s–100s+ Mbps (service dependent) | Moderate latency; better than GEO; jitter varies | Shared constellation capacity | Works where no terrestrial infra exists | Weather impacts; costs; variable under load | Remote/rural broadband; ships; backup | *Two‑way access; constellation; gateways* |
| **Satellite Internet (GEO)** | Unguided | Radio via geostationary satellites | Global coverage | 10s–100s Mbps (service dependent) | **High latency** (very noticeable), higher jitter | Shared | Wide coverage; simpler space segment | Latency hurts gaming/real‑time; weather impacts | Remote areas; niche uses | *Long propagation delay* |
| **Free‑Space Optics (FSO)** | Unguided (optical) | Laser/IR light through air (LOS) | 100s m–few km | 1–10+ Gbps (conditions dependent) | Very low latency; stable when clear | Typically dedicated link | “Fiber‑like” speed without digging | Fog/heavy rain/dust degrade; alignment sensitive | Building‑to‑building links; quick deployments | *Optical LOS; weather sensitivity (fog is big)* |
| **Terrestrial Broadcast TV (e.g., GoTV)** | Unguided | Radio broadcast from towers | City/region | Not interactive (downlink stream) | Not measured like internet access | Shared broadcast | Efficient one‑to‑many delivery | Mostly one‑way; not general internet | TV distribution | *Broadcast distribution, not typical “internet access”* |
| **Satellite TV (e.g., DStv)** | Unguided | Satellite broadcast downlink | Very wide | Not interactive (downlink stream) | Not measured like internet access | Shared broadcast | Huge coverage for TV | Mostly one‑way; weather fade | TV distribution | *Broadcast megaphone; dish + LNB* |

## Short takeaways

- **Guided media** (especially **fiber** and **switched Ethernet**) usually gives **lower jitter** and **more predictable latency** because the path is controlled and error rates are low.
- **Unguided media** trades predictability for **mobility and fast deployment**. Performance varies with interference, distance, obstacles, and contention.
- **“Access network” vs “last mile”**: last mile is the physical reach to the customer; access network includes that plus the provider’s nearby aggregation that hands you into the core.

## Mini “spot the edge” examples

- **Home fiber:** Laptop → Wi‑Fi/Ethernet → **ONT/router (customer edge)** → fiber → **ISP OLT/edge (provider side)** → ISP core → internet.
- **Mobile hotspot:** Laptop → Wi‑Fi → **iPhone (customer edge + NAT)** → cellular RAN → provider core → internet.

