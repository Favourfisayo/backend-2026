# Performance Analysis: Single-threaded vs Multi-threaded Execution

**Test Date:** February 12, 2026  
**Hardware:** 2-core CPU with 4 logical cores (hyperthreading)  
**Workload:** 20 billion iterations (counter increment)  

---

## 📊 Performance Comparison

### Execution Time Results

| Configuration | Execution Time | Speedup vs Baseline | Efficiency |
|--------------|----------------|---------------------|------------|
| **Main Thread Only** | 37.59 seconds | 1.0x (baseline) | 100% (single core) |
| **2 Worker Threads** | 19.71 seconds | **1.91x faster** | 95.5% |
| **4 Worker Threads** | 12.82 seconds | **2.93x faster** | 73.3% |

### Key Findings

✅ **Performance Gains:**
- **2 Worker Threads**: 47.6% faster than single-threaded (95.5% efficiency)
- **4 Worker Threads**: 65.9% faster than single-threaded (73.3% efficiency)

⚠️ **Diminishing Returns:**
- Going from 2 to 4 threads only provides 1.54x additional speedup (not 2x)
- 4-thread configuration shows ~27% efficiency loss due to overhead

---

## 🔬 CPU Profiling Analysis

### CPU Samples Distribution

#### Main Thread (Single-threaded)
- **Total CPU Samples**: 25,066
- **Duration**: 37.69 seconds
- **Function Nodes**: 105
- **Analysis**: All computation on one core; no parallelism; no thread overhead

#### 2 Worker Threads
- **Main Thread Samples**: 11,603 (Duration: 19.82s)
- **Worker 1 Samples**: 11,399 (Duration: 19.69s)
- **Worker 2 Samples**: 11,386 (Duration: 19.57s)
- **Total Samples**: 34,388
- **Analysis**: 
  - Near-perfect work distribution between workers
  - ~37% increase in total CPU samples (overhead from thread management)
  - Workers complete in nearly identical time (good load balancing)

#### 4 Worker Threads
- **Main Thread Samples**: 4,231 (Duration: 16.45s)
- **Worker 1 Samples**: 5,507 (Duration: 16.33s)
- **Worker 2 Samples**: 5,096 (Duration: 14.05s)
- **Worker 3 Samples**: 5,393 (Duration: 16.25s)
- **Worker 4 Samples**: 5,191 (Duration: 14.92s)
- **Total Samples**: 25,418
- **Analysis**:
  - Only ~1% increase in total samples vs single-threaded
  - More variation in worker completion times (14.05s to 16.33s)
  - Some workers finish earlier, causing idle CPU time
  - Thread contention and context switching overhead more apparent

---

## 💾 Heap Memory Profiling Analysis

### Memory Usage Comparison

| Configuration | Total Heap Usage | Overhead vs Baseline |
|--------------|------------------|----------------------|
| **Main Thread Only** | 512.25 KB | 0 KB (baseline) |
| **2 Worker Threads** | 5,634.00 KB | +5,121.75 KB (10x more) |
| **4 Worker Threads** | 12,290.55 KB | +11,778.30 KB (24x more) |

### Memory Distribution Details

#### Main Thread (Single-threaded)
- **Total Heap**: 512 KB - minimal overhead, efficient memory usage

#### 2 Worker Threads  
- **Main Thread**: 0 KB (orchestration only)
- **Worker 1**: 2,561.61 KB
- **Worker 2**: 3,072.39 KB
- **Total**: 5.5 MB  
- **Overhead**: Each worker thread maintains its own V8 isolate/context

#### 4 Worker Threads
- **Main Thread**: 1,536.17 KB (coordination overhead)
- **Worker 1**: 2,048.08 KB
- **Worker 2**: 2,561.38 KB
- **Worker 3**: 2,560.28 KB
- **Worker 4**: 3,584.63 KB
- **Total**: 12 MB  
- **Overhead**: Linear increase with worker count (~2.5 MB per worker)

**Key Insight**: Each worker thread requires ~2-3.5 MB of heap memory for its own runtime environment, resulting in significant memory overhead.

---

## 📈 When Performance Gains Outweigh Overhead

### ✅ **Use Multi-threading When:**

1. **CPU-bound computations** that can be parallelized
   - Example: This test showed 1.91x speedup with 2 threads (95.5% efficiency)
   
2. **Workload duration justifies overhead**
   - For tasks > 10 seconds, the parallelism benefit outweighs thread creation cost
   - Our 37-second task benefited greatly from parallelization

3. **Available CPU cores match thread count**
   - 2 threads on 2 physical cores = optimal (95.5% efficiency)
   - 4 threads on 4 logical cores = good but with overhead (73.3% efficiency)

4. **Memory is not a constraint**
   - Each worker requires 2-3 MB overhead
   - For high-concurrency scenarios, this adds up quickly

### ❌ **Overhead Dominates Performance When:**

1. **Diminishing returns with excessive threads**
   - Going from 2→4 threads only gave 1.54x improvement (not 2x)
   - Each additional thread adds:
     - Context switching overhead
     - Thread management overhead  
     - Memory overhead (~2.5 MB per thread)

2. **Thread count exceeds available cores**
   - With 4 logical cores, using >4 threads would cause:
     - Excessive context switching
     - CPU core contention
     - Reduced efficiency

3. **Short-duration tasks**
   - Thread creation/destruction overhead (~5-20ms) becomes significant
   - For tasks <100ms, overhead may exceed parallelism benefit

4. **Memory-constrained environments**
   - 24x memory increase for 4 threads
   - In low-memory systems, this could cause swapping and performance degradation

---

## 🎯 Optimal Configuration Recommendations

### For This Workload (CPU-intensive counting):

**Best Balance: 2 Worker Threads**
- **Reasoning:**
  - 95.5% efficiency (near-linear scaling)
  - Only 10x memory overhead (manageable)
  - Cuts execution time nearly in half
  - Minimal context switching and thread contention

**Maximum Performance: 4 Worker Threads**
- **Reasoning:**
  - 2.93x speedup (best absolute performance)
  - Acceptable 73.3% efficiency for maximum throughput
  - 24x memory overhead acceptable if memory available
  - Good for batch processing where latency is critical

### General Guidelines:

1. **Start with:** `Thread Count = Physical CPU Cores`
2. **Monitor efficiency:** If efficiency drops below 70%, reduce threads
3. **Consider memory:** Budget ~2-3 MB heap per worker thread
4. **Test incrementally:** Measure actual speedup, don't assume linear scaling

### When NOT to Use Worker Threads:

- Tasks completing in <1 second
- I/O-bound operations (use async/await instead)
- Workloads already parallelized at process level
- Memory-constrained environments (<100 MB available)
- Simple sequential operations with data dependencies

---

## 📁 Profiling Files Location

All profiling data is organized in `profiling_results/`:

```
profiling_results/
├── main_thread/
│   ├── cpu/
│   │   └── CPU.20260212.150722.556.0.001.cpuprofile (214 KB)
│   └── heap/
│       └── Heap.20260212.150928.16008.0.001.heapprofile (4.3 KB)
│
├── 2_worker_threads/
│   ├── cpu/
│   │   ├── CPU.20260212.150813.20368.0.001.cpuprofile (135 KB) - Main
│   │   ├── CPU.20260212.150813.20368.1.002.cpuprofile (129 KB) - Worker 1
│   │   └── CPU.20260212.150813.20368.2.003.cpuprofile (128 KB) - Worker 2
│   └── heap/
│       ├── Heap.20260212.151013.18672.0.001.heapprofile (153 B) - Main
│       ├── Heap.20260212.151013.18672.1.002.heapprofile (5.6 KB) - Worker 1
│       └── Heap.20260212.151013.18672.2.003.heapprofile (6.7 KB) - Worker 2
│
└── 4_worker_threads/
    ├── cpu/
    │   ├── CPU.20260212.150847.19944.0.001.cpuprofile (63 KB) - Main
    │   ├── CPU.20260212.150847.19944.1.002.cpuprofile (73 KB) - Worker 1
    │   ├── CPU.20260212.150847.19944.2.003.cpuprofile (67 KB) - Worker 2
    │   ├── CPU.20260212.150847.19944.3.004.cpuprofile (76 KB) - Worker 3
    │   └── CPU.20260212.150847.19944.4.005.cpuprofile (68 KB) - Worker 4
    └── heap/
        ├── Heap.20260212.151040.5360.0.001.heapprofile (9.4 KB) - Main
        ├── Heap.20260212.151040.5360.1.002.heapprofile (2.5 KB) - Worker 1
        ├── Heap.20260212.151040.5360.2.003.heapprofile (7.1 KB) - Worker 2
        ├── Heap.20260212.151040.5360.3.005.heapprofile (3.3 KB) - Worker 3
        └── Heap.20260212.151040.5360.4.004.heapprofile (4.6 KB) - Worker 4
```

### How to View Profiles in Chrome DevTools:

1. Open Chrome/Edge browser
2. Navigate to `chrome://inspect` or `edge://inspect`
3. Click "Open dedicated DevTools for Node"
4. Go to "Profiler" or "Memory" tab
5. Click "Load" and select the `.cpuprofile` or `.heapprofile` file
6. Analyze the flame graph and call tree

---

## 🏁 Conclusion

This experiment demonstrates that **multi-threading provides significant performance gains for CPU-intensive tasks**, but comes with:

1. **Memory overhead**: 2-3 MB per worker thread
2. **Efficiency loss**: ~27% efficiency drop going from 2 to 4 threads
3. **Diminishing returns**: Each additional thread provides less speedup

**Key Takeaway:** For optimal performance, match thread count to physical CPU cores and monitor efficiency. The 2-worker configuration offered the best balance of performance (1.91x speedup) and efficiency (95.5%), while the 4-worker configuration maximized speed (2.93x) at the cost of efficiency (73.3%) and memory (24x overhead).
