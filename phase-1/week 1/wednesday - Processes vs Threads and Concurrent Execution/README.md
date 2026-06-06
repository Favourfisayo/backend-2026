# Worker Threads Performance Demo

This project demonstrates the performance characteristics of single-threaded vs multi-threaded JavaScript execution using Node.js Worker Threads.

## 📁 Project Structure

```
├── main_thread.js                          # Single-threaded baseline execution
├── threading_demo_2_worker_threads.js      # 2 worker threads (50% CPU utilization)
├── threading_demo_4_worker_threads.js      # 4 worker threads (100% CPU utilization)
├── workers-threads.js                      # Worker thread implementation
├── analyze_profiles.js                     # Script to analyze profiling data
├── PERFORMANCE_ANALYSIS.md                 # Comprehensive performance report
└── profiling_results/                      # Organized profiling data
    ├── main_thread/
    │   ├── cpu/                            # CPU profiling data
    │   └── heap/                           # Heap profiling data
    ├── 2_worker_threads/
    │   ├── cpu/
    │   └── heap/
    └── 4_worker_threads/
        ├── cpu/
        └── heap/
```

## 🚀 Running the Scripts

### Basic Execution

```bash
# Single-threaded (baseline)
node main_thread.js

# 2 worker threads
node threading_demo_2_worker_threads.js

# 4 worker threads (full CPU utilization)
node threading_demo_4_worker_threads.js
```

### With CPU Profiling

```bash
# Generate CPU profiling data
node --cpu-prof main_thread.js
node --cpu-prof threading_demo_2_worker_threads.js
node --cpu-prof threading_demo_4_worker_threads.js
```

This generates `.cpuprofile` files that can be opened in Chrome DevTools.

### With Heap Profiling

```bash
# Generate heap profiling data
node --heap-prof main_thread.js
node --heap-prof threading_demo_2_worker_threads.js
node --heap-prof threading_demo_4_worker_threads.js
```

This generates `.heapprofile` files that can be opened in Chrome DevTools.

## 📊 Viewing Profile Results

### Automated Analysis

```bash
node analyze_profiles.js
```

This script reads all profiling data and outputs:
- CPU sample counts and durations for each thread
- Heap memory usage for each thread
- Performance comparison and efficiency calculations

### Manual Analysis in Chrome DevTools

1. Open Chrome browser
2. Navigate to `chrome://inspect`
3. Click "Open dedicated DevTools for Node"
4. Go to "Profiler" tab (for CPU) or "Memory" tab (for heap)
5. Click "Load" and select a profile file from `profiling_results/`
6. Explore the flame graph and call tree

## 🎯 Key Results Summary

| Configuration | Time | Speedup | Efficiency | Memory |
|--------------|------|---------|------------|--------|
| Main Thread | 37.59s | 1.0x | 100% | 512 KB |
| 2 Workers | 19.71s | 1.91x | 95.5% | 5.5 MB |
| 4 Workers | 12.82s | 2.93x | 73.3% | 12 MB |

**Key Insights:**
- ✅ 2 workers provide near-linear speedup (95.5% efficiency)
- ⚠️ 4 workers show diminishing returns (73.3% efficiency)
- 💾 Memory overhead: ~2.5 MB per worker thread
- 🎯 Optimal: Match thread count to physical CPU cores

## 📖 Detailed Analysis

For comprehensive analysis including:
- CPU profiling breakdown
- Heap memory analysis
- When to use multi-threading vs single-threading
- Performance gains vs overhead tradeoffs

**See:** [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md)

## 🔧 System Requirements

- **Node.js**: v14.0.0 or higher (Worker Threads support)
- **CPU**: Multi-core processor (tests designed for 2-4 cores)
- **Memory**: At least 100 MB free RAM
- **OS**: Windows, macOS, or Linux

## 💡 Understanding the Code

### main_thread.js
Simple blocking function that counts to 20 billion on a single thread. This is the baseline for comparison.

### threading_demo_*_worker_threads.js
Creates multiple worker threads, divides the workload equally among them, and aggregates the results. Each worker counts to `20 billion / thread_count`.

### workers-threads.js
The worker implementation that receives the thread count via `workerData`, performs the counting operation, and posts the result back to the main thread.

## 🧪 Experiment Variables

- **Workload**: 20 billion iterations (counter++)
- **Hardware**: 2 physical cores, 4 logical cores (hyperthreading)
- **Thread Counts**: 1 (main only), 2, and 4 workers
- **Profiling**: CPU sampling and heap snapshots

## 📚 Learning Outcomes

This demonstration illustrates:
1. **Parallel execution benefits** for CPU-intensive tasks
2. **Overhead costs** of thread creation and management
3. **Diminishing returns** when thread count exceeds physical cores
4. **Memory implications** of worker threads
5. **Practical thread tuning** for real-world applications

## 🔗 Related Concepts

- Node.js Worker Threads
- CPU-bound vs I/O-bound operations
- Thread pools and concurrency
- Performance profiling techniques
- Amdahl's Law (parallel speedup limits)
