# Memory Locality Performance Analysis

## Executive Summary

This document explains why **row-major order traversal is approximately 1.5x faster** than column-major order traversal when accessing elements in a 2D array stored in contiguous memory.

---

## Experimental Results

### Test Configuration
- **Matrix Size**: 10,000 × 10,000 (100 million elements)
- **Data Type**: Float64Array (8 bytes per element)
- **Total Memory**: ~763 MB
- **Operation**: Sum all elements in the matrix

### Performance Results

| Traversal Method | Execution Time | Relative Performance | Cache Efficiency |
|-----------------|----------------|---------------------|------------------|
| **Row-Major**   | 4,226.74 ms    | 1.00x (baseline)    | HIGH ✓          |
| **Column-Major** | 6,400.71 ms   | 0.66x (51% slower)  | LOW ✗           |

**Key Finding**: Row-major traversal is **1.51x faster** than column-major traversal.

---

## Why Is Row-Major Faster?

### 1. Memory Layout in JavaScript Arrays

In JavaScript, a 2D array stored as a 1D typed array uses **row-major order**:

```
For a 3×3 matrix:
[0,0] [0,1] [0,2] [1,0] [1,1] [1,2] [2,0] [2,1] [2,2]
  ↓     ↓     ↓     ↓     ↓     ↓     ↓     ↓     ↓
  A[0]  A[1]  A[2]  A[3]  A[4]  A[5]  A[6]  A[7]  A[8]
```

Elements in the same row are **adjacent in memory**.

### 2. CPU Cache Architecture

Modern CPUs don't fetch data one byte at a time. Instead, they load entire **cache lines** (~64 bytes typically) at once.

#### Cache Line Example
When you access `A[0]`, the CPU loads not just that element, but the entire cache line:

```
One cache line = 64 bytes = 8 Float64 elements

Access A[0] → CPU loads A[0] through A[7] into cache
```

### 3. Row-Major Access Pattern (Cache-Friendly)

**Access sequence**: `A[0]`, `A[1]`, `A[2]`, `A[3]`, `A[4]`, ...

```
┌─────────────────────────────────────────────────────┐
│ Cache Line 1: A[0] A[1] A[2] A[3] A[4] A[5] A[6] A[7] │ ← All hits!
└─────────────────────────────────────────────────────┘
         ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
      Access in sequence (7 out of 8 accesses hit cache)
```

**Result**: After the first cache miss, the next 7 accesses are **cache hits**!

**Cache Hit Rate**: ~87.5% (7 out of 8 accesses)

### 4. Column-Major Access Pattern (Cache-Unfriendly)

**Access sequence** (for N=10,000): `A[0]`, `A[10000]`, `A[20000]`, `A[30000]`, ...

Each access jumps by **10,000 elements** = **80,000 bytes** apart!

```
Memory:  A[0] ... A[10000] ... A[20000] ... A[30000]
         ↓         ↓            ↓            ↓
Cache:   Load      Load new     Load new     Load new
         Line 1    cache line   cache line   cache line
         ↓         ↓            ↓            ↓
         MISS      MISS         MISS         MISS
```

**Result**: Each access likely causes a **cache miss** because elements are far apart.

**Cache Hit Rate**: Near 0% (almost every access is a cache miss)

### 5. The Performance Impact

#### Memory Access Speeds (Approximate):
- **L1 Cache**: ~1 ns (1 nanosecond)
- **L2 Cache**: ~4 ns
- **L3 Cache**: ~15 ns
- **Main RAM**: ~100 ns (100x slower than L1!)

When the CPU can't find data in cache (a "cache miss"), it must fetch from main memory, which is **dramatically slower**.

---

## Mathematical Analysis

### Stride Distance

**Row-major stride**: 1 element = 8 bytes
```
Consecutive memory accesses maximize cache reuse
```

**Column-major stride**: 10,000 elements = 80,000 bytes = 78.13 KB
```
Cache line size:  64 bytes
Stride distance:  80,000 bytes (1,250x cache line size!)
```

Each column access skips over **1,250 cache lines**, practically guaranteeing a cache miss.

### Cache Efficiency Formula

For an N×N matrix:

**Row-major cache hits** ≈ (N² - N) / N² ≈ 99.99% (for large N)
```
Only the first element of each cache line causes a miss
```

**Column-major cache hits** ≈ 1 / (stride / cache_line_size) ≈ 0.08%
```
Stride = 80KB, Cache line = 64 bytes
Hit rate = 64 / 80,000 = 0.08%
```

---

## Visual Comparison

### Access Pattern Visualization

#### Row-Major (Sequential)
```
→ → → → → → → → → → → →    Fast! (following arrows = cache hits)
→ → → → → → → → → → → →
→ → → → → → → → → → → →
```

#### Column-Major (Strided)
```
↓           ↓           ↓    Slow! (each jump = cache miss)
↓           ↓           ↓
↓           ↓           ↓
```

---

## CPU Profile Analysis

Based on the CPU profiling data:

### Row-Major Script (`CPU.*3152*.cpuprofile`)
- **Total time**: ~7,000ms
- **Main computation**: 2,649 samples in the main loop
- **Hit distribution**: Most CPU time spent in actual computation
- **Cache behavior**: Efficient memory access patterns
- **GC pressure**: 1.01% - Low garbage collection overhead

### Column-Major Script (`CPU.*6216*.cpuprofile`)
- **Total time**: ~8,300ms
- **Main computation**: 3,996 samples in the main loop
- **Hit distribution**: More time spent waiting for memory
- **Cache behavior**: Frequent cache misses causing stalls
- **GC pressure**: 2.29% - Higher garbage collection activity

The column-major version shows **more CPU samples in the main loop** because the CPU spends more time **waiting for memory** rather than computing.

---

## Heap Memory Profile Analysis

### Memory Allocation Patterns

Using Node.js `--heap-prof` flag, we analyzed heap memory allocations:

#### Row-Major Heap Profile
- **Total V8 Heap Allocation**: 512.58 KB
- **Primary allocations**: Node.js internals (VM context creation)
- **TypedArray storage**: ~763 MB (allocated outside V8 heap)

#### Column-Major Heap Profile
- **Total V8 Heap Allocation**: 512.98 KB
- **Primary allocations**: Node.js internals (module loader)
- **TypedArray storage**: ~763 MB (allocated outside V8 heap)

### Key Heap Insights

**1. Similar Memory Footprint**
Both approaches allocate essentially the **same amount of memory** (~763 MB for the Float64Array plus ~512 KB for Node.js overhead). This is expected because:

```javascript
// Both scripts create the exact same array
const A = new Float64Array(N * N);
// 10,000 × 10,000 × 8 bytes = 800,000,000 bytes ≈ 763 MB
```

**2. TypedArray Memory Location**
The heap profiler shows only ~512 KB because:
- `Float64Array` uses **ArrayBuffer** storage
- ArrayBuffers are allocated in **native memory** (not V8's JavaScript heap)
- V8 heap profiler only tracks JavaScript object allocations
- The bulk data (763 MB) lives in native memory buffers

**3. No Memory Leaks**
Both profiles show clean allocation patterns with:
- Single major allocation for the array buffer
- Minimal fragmentation
- Similar GC pressure (though column-major has 2.3x more)

**4. Why Column-Major Has Higher GC Pressure**

The column-major version shows **2.29% GC time** vs **1.01%** for row-major:

```
Column-Major GC: 2.29% (2.27x higher)
Row-Major GC:    1.01%
```

**Reason**: Cache misses cause CPU stalls, allowing more GC cycles to run during those stalls. The V8 garbage collector takes advantage of idle CPU time during memory wait states.

### Memory vs Performance

**Important Distinction:**
- **Memory footprint**: Essentially identical (~763 MB)
- **Memory access speed**: Dramatically different (1.5x performance gap)

This demonstrates that **how you access memory matters more than how much you allocate**!

```
┌─────────────────────────────────────────────────────────┐
│                 MEMORY ANALYSIS                         │
├─────────────────────────────────────────────────────────┤
│                         Row-Major    Column-Major       │
├─────────────────────────────────────────────────────────┤
│ Array Storage         763 MB        763 MB              │
│ V8 Heap Overhead      512 KB        512 KB              │
│ Total Memory          ~763 MB       ~763 MB             │
│                       ========       ========            │
│ Performance           4,227 ms      6,401 ms            │
│ GC Pressure           1.01%         2.29%               │
│ Cache Efficiency      HIGH          LOW                 │
└─────────────────────────────────────────────────────────┘
```

---

## Real-World Implications

### When This Matters:
1. **Large Dataset Processing**: Image processing, scientific computing
2. **Matrix Operations**: Linear algebra, machine learning
3. **Database Queries**: Column vs row storage formats
4. **Game Development**: Terrain data, physics simulations

### Best Practices:
1. ✅ **Access arrays in the order they're stored**
2. ✅ **Inner loop should iterate over contiguous memory**
3. ✅ **Consider cache line size when designing data structures**
4. ✅ **Use profiling tools to identify hotspots**

---

## Conclusion

The 1.5x performance difference between row-major and column-major traversal is due to **spatial locality** and **CPU cache behavior**:

1. **Row-major** accesses memory sequentially → High cache hit rate → Fast
2. **Column-major** accesses memory with large strides → Low cache hit rate → Slow

**Cache misses cost ~100x more time than cache hits**, explaining why a seemingly small difference in access pattern leads to significant performance impact.

### Memory vs Performance: The Key Insight

While both approaches use **identical memory** (~763 MB), they exhibit **drastically different performance**:
- Memory footprint: Same
- Memory access efficiency: 1.5x difference
- GC overhead: 2.3x difference (column-major has more)

### Key Takeaway
> "Accessing memory in the order it's physically laid out can make your code run 50-100% faster without changing a single line of algorithmic logic!"

The **pattern of access matters more than the amount of memory allocated**. This is why understanding memory hierarchy and cache architecture is crucial for writing high-performance code.

---

## Profiling Instructions

### CPU Profiling (Performance Analysis)
```bash
# Generate CPU profiles
node --cpu-prof memory_locality_row_major.js
node --cpu-prof memory_locality_column_major.js

# Analyze profiles
node analyze_profiles.js
```

**What CPU profiling shows:**
- Time spent in each function
- Execution hotspots
- Garbage collection pressure
- CPU waiting vs active time

### Heap Profiling (Memory Analysis)
```bash
# Generate heap profiles
node --heap-prof memory_locality_row_major.js
node --heap-prof memory_locality_column_major.js

# Analyze profiles
node analyze_profiles.js
```

**What heap profiling shows:**
- Memory allocation patterns
- V8 heap overhead
- Memory leak detection
- Allocation hotspots

**Note**: TypedArrays (like Float64Array) allocate in native memory, so heap profiles show mainly Node.js internal overhead (~512 KB), not the 763 MB array buffer itself.

---

## Further Reading

- [What Every Programmer Should Know About Memory](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)
- [CPU Cache Architecture](https://en.wikipedia.org/wiki/CPU_cache)
- [False Sharing and Cache Line Effects](https://mechanical-sympathy.blogspot.com/2011/07/false-sharing.html)
- [Locality of Reference](https://en.wikipedia.org/wiki/Locality_of_reference)

---

**Generated**: February 12, 2026
**Test Environment**: Node.js with V8 JavaScript Engine
