# Memory Locality & Cache Performance Demonstration

> **Understanding how memory access patterns affect CPU cache performance**

This project demonstrates the dramatic performance impact of cache-friendly vs cache-unfriendly memory access patterns through practical examples and detailed analysis.

## 📁 Project Files

| File | Description |
|------|-------------|
| `memory_locality.js` | Original combined script |
| `memory_locality_row_major.js` | **Row-major traversal** (cache-friendly) with detailed comments |
| `memory_locality_column_major.js` | **Column-major traversal** (cache-unfriendly) with detailed comments |
| `memory_locality_comparison.js` | Side-by-side comparison with timing & visual output |
| `analyze_profiles.js` | **CPU & Heap profile analyzer** with colorful terminal output |
| `ANALYSIS.md` | **Comprehensive explanation** with CPU & heap profiling insights |

## 🚀 Quick Start

### 1. Run Individual Scripts

```bash
# Run row-major (fast)
node memory_locality_row_major.js

# Run column-major (slow)
node memory_locality_column_major.js
```

### 2. Run Comparison (Recommended)

```bash
node memory_locality_comparison.js
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║      MEMORY LOCALITY PERFORMANCE COMPARISON               ║
╚═══════════════════════════════════════════════════════════╝

Matrix Size: 10,000 x 10,000
Total Elements: 100,000,000
Memory Usage: 762.94 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 1: Row-Major Traversal (Cache-Friendly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execution Time: 4226.74 ms ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 2: Column-Major Traversal (Cache-Unfriendly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execution Time: 6400.71 ms ✗

Result: Row-major is 1.51x faster!
```

### 3. Profile with CPU & Heap Profiling

Generate detailed CPU and memory profiles:

```bash
# CPU profiling (performance analysis)
node --cpu-prof memory_locality_row_major.js
node --cpu-prof memory_locality_column_major.js

# Heap profiling (memory analysis)
node --heap-prof memory_locality_row_major.js
node --heap-prof memory_locality_column_major.js
```

This generates `.cpuprofile` and `.heapprofile` files that provide detailed insights into:
- **CPU profiles**: Execution time, hotspots, GC pressure
- **Heap profiles**: Memory allocations, V8 heap usage, allocation patterns

### 4. Analyze Profiles

```bash
node analyze_profiles.js
```

**Sample Output:**
```
╔════════════════════════════════════════════════════════════╗
║      CPU & HEAP PROFILE ANALYZER FOR NODE.JS              ║
╚════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════
                 CPU PROFILE ANALYSIS
═══════════════════════════════════════════════════════════

Row-Major:          6,985 ms  (2,883 samples) - GC: 1.01%
Column-Major:       8,276 ms  (4,238 samples) - GC: 2.29%

VERDICT: Row-Major is 1.18x faster

═══════════════════════════════════════════════════════════
                 HEAP PROFILE ANALYSIS
═══════════════════════════════════════════════════════════

Row-Major:          512.58 KB V8 heap + 763 MB TypedArray
Column-Major:       512.98 KB V8 heap + 763 MB TypedArray

Both approaches use identical memory, but column-major has
2.3x higher GC pressure due to cache-miss-induced CPU stalls.
```

## 📊 Performance Results

### Timing Comparison

| Method | Time (ms) | Relative Speed | Cache Efficiency |
|--------|-----------|----------------|------------------|
| **Row-Major** | 4,226.74 | 1.00x (baseline) | HIGH ✓ |
| **Column-Major** | 6,400.71 | 0.66x (51% slower) | LOW ✗ |

### Visual Comparison

```
Row-Major:    ████████████████████████████ (100%)
Column-Major: ██████████████████████████████████████████ (151%)
```

**Speedup: 1.51x** (Column-major is 51% slower)

## 🧠 Why The Difference?

### Cache Lines & Memory Access

CPUs load memory in **cache lines** (~64 bytes = 8 Float64 values):

#### Row-Major (Efficient)
```
Access: A[0] → A[1] → A[2] → A[3] → ...
        │      │      │      │
        └──────┴──────┴──────┴─ ALL in same cache line!
        
Cache hit rate: ~87.5% (7 out of 8 accesses)
```

#### Column-Major (Inefficient)
```
Access: A[0] → A[10000] → A[20000] → A[30000] → ...
        │        │           │           │
        80 KB    80 KB       80 KB       80 KB apart
        
Cache hit rate: ~0% (each access misses cache)
```

### The Cost

- **Cache hit**: ~1 nanosecond (L1 cache)
- **Cache miss**: ~100 nanoseconds (main RAM)

**Cache misses are 100x slower!**

## 📖 Detailed Explanation

See [ANALYSIS.md](ANALYSIS.md) for:

- ✅ Complete theoretical explanation
- ✅ Memory layout visualizations
- ✅ Cache architecture details
- ✅ Mathematical analysis
- ✅ CPU profile interpretation
- ✅ Real-world implications
- ✅ Best practices

## 🔬 What's Being Measured

### Performance Metrics

Both scripts measure:
1. **Execution time** - How long the computation takes
2. **CPU usage** - Time in computation vs waiting (via profiling)
3. **Memory allocation** - Heap usage and TypedArray storage
4. **GC pressure** - Garbage collection overhead

### Code Structure

Both scripts do the same thing:
1. Create a 10,000 × 10,000 matrix (100M elements, ~763 MB)
2. Initialize with sequential values
3. Sum all elements
4. Measure execution time

### Only Difference: Loop Order

**Row-Major (Fast):**
```javascript
for (let i = 0; i < N; i++) {      // Outer: rows
  for (let j = 0; j < N; j++) {    // Inner: columns
    sum += A[i * N + j];           // Sequential access
  }
}
```

**Column-Major (Slow):**
```javascript
for (let j = 0; j < N; j++) {      // Outer: columns
  for (let i = 0; i < N; i++) {    // and `--heap-prof` support)
- **Memory**: ~1 GB RAM available
- **Platform**: Windows, macOS, or Linux
- **Disk Space**: ~100 MB for profile files
}
```

## 🛠️ Technical Requirements

- **Node.js**: v14+ (for `--cpu-prof` support)
- **Memory**: ~1 GB RAM available
- **Platform**: Windows, macOS, or Linux

## 📦 Project Structure

```
.
├── memory_locality.js                  # Original script
├── memory_locality_row_major.js        # Row-major with comments
├── memory_locality_column_major.js     # Column-major with comments
├── memory_locality_comparison.js       # Comparison runner
├── analyze_profiles.js                 # Profile analyzer
├── ANALYSIS.md                         # Deep-dive explanation
├── RMemory allocation ≠ Performance**: Same memory footprint, different speed
5. **Profile to verify**: Always measure actual CPU and memory behavior
6. **Hardware architecture**: Understanding CPU cache helps write faster code
7. **GC correlation**: Cache misses increase GC pressure (CPU stalls = GC opportunities)
```

## 🎯 Key Learnings

1. **Spatial locality matters**: Access memory sequentially when possible
2. **Cache lines are real**: Modern CPUs load 64 bytes at a time
3. **Small changes, big impact**: Loop order can change performance by 50%+
4. **Profile to verify**: Always measure actual performance
5. **Hardware architecture**: Understanding CPU cache helps write faster code
use more memory?

**A:** Both approaches allocate the **exact same data structure** (a 10,000 × 10,000 Float64Array). The difference is:
### Q: Why doesn't the column-major version take 100x longer?

**A:** Several mitigatingocation**: Identical (~763 MB)
- **Memory access pattern**: Completely different
- **Result**: Same memory, 50% performance difference

This prWhy does column-major have higher GC pressure?

**A:** Cache misses cause CPU stalls. During these stalls, the V8 garbage collector takes advantage of the idle CPU time to run collection cycles. This is why column-major shows 2.29% GC time vs 1.01% for row-major, even though they allocate the same memory.

### Q: Yes! Heap profiles reveal:
- V8 JavaScript heap overhead (~512 KB)
- Memory allocation patterns
- GC pressure differences (2.3x higher for column-major!)
- Proof that memory footprint is identical
- The distinction between allocation and access efficiency

### Q: Is this only a JavaScript issue?pedArrays use native memoryry matters more than how much you allocate**!
## 🔍 Common Questions

### Q: Why doesn't the column-major version take 100x longer?

**A:** Several factors:
- Modern CPUs have prefetchers that predict patterns
- Multiple cache levels (L1, L2, L3) provide some help
- The operation (addition) is very fast, reducing impact
- Memory bandwidth can handle some inefficiency

### Q: Is this only a JavaScript issue?

**A:** No! This applies to all languages:
- **C/C++**: Same principle with arrays
- **Python**: NumPy arrays benefit from cache-friendly access
- **Java**: Array access patterns matter
- **Fortran**: Actually uses column-major by default!

### Q: When does this matter in practice?

**A:** Anytime you process large datasets:
- Image/video processing
- Machine learning (matrix operations)
- Scientific computing
- Database queries
- Game engines (terrain, particles)

## 🚦 Performance Tips

### DO ✅
- Access arrays in the order they're stored
- Make inner loops iterate over contiguous memory
- Consider cache line size in data structure design
- Profile code to find hotspots

### DON'T ❌
- Assume all access patterns are equal
- Ignore memory layout when optimizing
- Optimize without measuring first
- Write "clever" code that fights the cache

## 📚 Further Reading

- [ANALYSIS.md](ANALYSIS.md) - Full explanation in this repo
- [What Every Programmer Should Know About Memory](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)
- [Gallery of Processor Cache Effects](https://igoro.com/archive/gallery-of-processor-cache-effects/)
- [Mechanical Sympathy Blog](https://mechanical-sympathy.blogspot.com/)

## 🏆 Credits

**Week 1 - Tuesday**: Memory Hierarchy & Caching  
**Phase 1**: Backend Engineering Roadmap  
**Date**: February 12, 2026

---

## 📝 License

Educational use - feel free to learn, modify, and share!

---

**Made with ❤️ to understand computer architecture better**

Run the scripts and see the difference yourself! 🚀
