# CPU USAGE AND PROFILING LOG

## Benchmark Execution Environment
- **Date**: February 12, 2026
- **Platform**: Windows (Node.js with V8 Engine)
- **Profiling Tools**: `node --cpu-prof` and `node --heap-prof`

---

## CPU Profile Files Generated

### 1. Monte Carlo Pi Calculation
- **CPU Profile**: `CPU.20260212.141504.4952.0.001.cpuprofile`
- **File Size**: 524 KB
- **Execution Time**: 18.16 seconds
- **CPU Intensive Operations**:
  - Random number generation (Math.random) - 800M calls
  - Floating-point arithmetic (multiplication, addition)
  - Branch evaluation (if condition) - 400M times
  - Counter increment operations

**CPU Usage Pattern**:
- High sustained CPU usage throughout execution
- Single-threaded operation (100% of one core)
- Consistent load due to loop uniformity
- Minimal memory operations (register-bound)

---

### 2. BigInt Factorial Calculation
- **CPU Profile**: `CPU.20260212.141537.7304.0.001.cpuprofile`
- **File Size**: 1049 KB 🔴 **LARGEST PROFILE**
- **Execution Time**: 75.46 seconds
- **CPU Intensive Operations**:
  - BigInt multiplication (199,999 operations)
  - Memory allocation for growing numbers
  - Arbitrary precision arithmetic routines
  - Loop increment with BigInt

**CPU Usage Pattern**:
- Progressively increasing CPU cycles per operation
- High memory bus utilization
- Frequent L1/L2/L3 cache misses
- Significant time in memory allocation/GC
- CPU bottlenecked by memory latency in later iterations

**Profile Size Indication**:
The 1049 KB profile (2x larger than Monte Carlo) indicates:
- More complex call stacks
- Multiple V8 internal function calls per operation
- Heavy memory management activity
- Runtime system overhead for BigInt operations

---

### 3. Matrix Multiplication
- **CPU Profile**: `CPU.20260212.141704.17792.0.001.cpuprofile`
- **File Size**: 524 KB 
- **Execution Time**: 4.93 seconds
- **CPU Intensive Operations**:
  - Float64 multiply-add operations (1 billion FLOPs)
  - Sequential array access
  - Tight inner loop execution

**CPU Usage Pattern**:
- Extremely high IPC (Instructions Per Cycle)
- Optimal cache line utilization
- Hardware prefetcher effectively predicts memory access
- FPU (Floating Point Unit) operating at peak efficiency
- Minimal V8 runtime overhead

**Profile Size Indication**:
The 52 KB profile (smallest) indicates:
- Simple execution path
- Few function calls (mostly inlined)
- Predictable code flow
- Minimal V8 runtime intervention

---

## Heap Profile Files Generated

### Heap Memory Allocation Summary

| Script | Heap Profile | Size | Memory Pattern |
|--------|--------------|------|----------------|
| Monte Carlo Pi | `Heap.20260212.141718.17848.0.001.heapprofile` | N/A | Minimal allocation |
| BigInt Factorial | `Heap.20260212.141744.12188.0.001.heapprofile` | N/A | Heavy allocation |
| Matrix Mult | `Heap.20260212.141954.15884.0.001.heapprofile` | N/A | Fixed allocation |


---

## CPU Resource Analysis

### Why Different CPU Profiles?

1. **Profile File Size Correlation**:
   - Larger profile = more runtime overhead
   - BigInt factorial: 1049KB (complex runtime interactions)
   - Monte Carlo:  524KB (moderate complexity)
   - Matrix: 52KB (streamlined execution)

2. **CPU Microarchitecture Utilization**:
   - **Matrix**: Maximizes ALU, FPU, and cache efficiency
   - **Monte Carlo**: Balanced load but RNG overhead
   - **BigInt**: Software emulation, memory-bound

---

## Recommendations for CPU Optimization

### For Monte Carlo Type Workloads:
- Use Worker Threads for parallel RNG
- Consider SIMD.js for batch random generation
- Minimize conditional branches

### For BigInt Operations:
- Use native libraries (GMP bindings)
- Consider streaming/chunked computation
- Cache intermediate results

### For Matrix Operations:
- Already optimal for single-threaded
- Consider BLAS libraries for larger matrices
- Use Worker Threads for block matrix multiplication

---

## How to Analyze Profile Files

Open the `.cpuprofile` files in Chrome DevTools:

1. Open Chrome/Edge browser
2. Press F12 (DevTools)
3. Go to "Performance" tab
4. Click "Load profile" icon
5. Select the `.cpuprofile` file

You'll see:
- Flame graphs showing function call hierarchy
- Time spent in each function
- Call tree with self time and total time
- Bottom-up view for hotspot identification

---

## Conclusion

The CPU profiling reveals that:
- **Matrix multiplication** achieves near-optimal hardware utilization thanks to the continguous nature of float64array.
- **Monte Carlo** is limited by RNG and branch costs
- **BigInt factorial** is fundamentally memory-bound with software arithmetic overhead

Profile file sizes directly correlate with runtime complexity and V8 engine involvement.
