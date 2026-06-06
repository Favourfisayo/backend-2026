# CPU Benchmark Analysis

## Performance Results Summary

| Operation | Execution Time | Relative Performance |
|-----------|---------------|---------------------|
| Matrix Multiplication | ~4.7 seconds | ⚡ **FASTEST** (Baseline) |
| Monte Carlo Pi | ~18.1 seconds | **3.85x slower** |
| BigInt Factorial | ~75.5 seconds | ⚠️ **SLOWEST** (16.1x slower) |

---

## Why BigInt Factorial Took the Longest (75.5 seconds)

### Primary Factors:

1. **Arbitrary-Precision Arithmetic Overhead**
   - BigInt operations require dynamically-sized memory allocation
   - Unlike fixed-width integers (32/64-bit), BigInt grows with the result
   - factorial(200,000) produces a number with **973,351 digits**
   - Each multiplication requires handling increasingly large operands

2. **Memory Allocation & Reallocation**
   - Continuous memory allocation as the result grows
   - Frequent heap operations for dynamic sizing
   - More cache misses due to unpredictable memory access patterns
   - Garbage collection pressure from intermediate values

3. **Computational Complexity**
   - Performs 199,999 multiplication operations
   - Each subsequent multiplication involves larger numbers
   - Time complexity grows super-linearly: O(n²) or worse for BigInt multiplication
   - Final multiplication involves numbers with hundreds of thousands of digits

4. **Lack of Hardware Optimization**
   - No SIMD or vectorization possible
   - Cannot leverage CPU's native integer multiplication units
   - Software-based arbitrary precision arithmetic is inherently slow

---

## Why Monte Carlo Pi Took Moderate Time (18.1 seconds)

### Key Characteristics:

1. **Pure Computational Load**
   - Performs 400 million iterations
   - Each iteration: 2 random numbers, 2 multiplications, 1 addition, 1 comparison
   - Simple integer operations that benefit from CPU cache

2. **Memory Efficiency**
   - Minimal memory allocation (only loop variables)
   - All data fits in CPU registers/L1 cache
   - No heap allocation during loop execution

3. **Random Number Generation Cost**
   - `Math.random()` is called 800 million times (2 per iteration)
   - RNG has non-trivial computational cost
   - Involves state updates and floating-point operations

4. **Why Slower than Matrix Multiplication?**
   - Branch prediction overhead from conditional (`if` statement)
   - 400M branch predictions vs matrix's predictable memory access
   - RNG state management prevents optimization
   - Cannot vectorize due to sequential random dependencies

---

## Why Matrix Multiplication Was Fastest (4.7 seconds)

### Optimization Advantages:

1. **Cache-Optimized Algorithm (i-k-j order)**
   ```javascript
   for (let i = 0; i < N; i++) {
     for (let k = 0; k < N; k++) {
       const aik = A[iN + k];  // Loaded once per k
       for (let j = 0; j < N; j++) {
         C[iN + j] += aik * B[kN + j];  // Sequential access to C
       }
     }
   }
   ```
   - Inner loop accesses `C` and `B` sequentially (cache-friendly)
   - Prefetching works optimally
   - Minimizes cache misses

2. **Typed Arrays (Float64Array)**
   - Contiguous memory layout
   - Direct hardware-friendly representation
   - No boxing/unboxing overhead
   - Enables SIMD optimization by V8 (if available)

3. **Predictable Memory Access Patterns**
   - Sequential reads and writes
   - CPU can effectively prefetch data
   - Branch predictor has no work (no conditionals in hot loops)

4. **Native Floating-Point Operations**
   - Hardware FPU handles all operations
   - Single-cycle multiply-add operations on modern CPUs
   - V8's JIT compiler can optimize effectively

5. **Fixed Memory Footprint**
   - All arrays allocated once at start
   - No garbage collection during computation
   - Memory fits well in L2/L3 cache (3MB for 1000x1000 Float64)

---

## CPU Architecture Insights

### Modern CPU Features Utilized:

- **Matrix Multiplication**: ✅ Cache locality, ✅ Prefetching, ✅ FPU, ✅ Potential SIMD
- **Monte Carlo Pi**: ✅ FPU, ⚠️ Branch prediction, ❌ SIMD (dependencies)
- **BigInt Factorial**: ❌ Most optimizations unavailable

### Cache Hierarchy Impact:

1. **Matrix Multiplication**
   - Working set: 3MB (fits in L3 cache on most CPUs)
   - Sequential access maximizes cache line utilization

2. **Monte Carlo Pi**
   - Minimal memory footprint (registers only)
   - RNG state might cause L1 cache thrashing

3. **BigInt Factorial**
   - Growing working set exceeds all cache levels
   - RAM access latency dominates performance
   - Memory bandwidth becomes bottleneck

---

## Conclusion

The performance hierarchy reflects how well each algorithm leverages modern CPU architecture:

1. **Matrix Multiplication** wins by using cache-friendly patterns, typed arrays, and predictable memory access
2. **Monte Carlo Pi** is limited by RNG overhead and branch prediction costs despite simplicity
3. **BigInt Factorial** suffers from arbitrary-precision arithmetic requiring dynamic memory and software-based multiplication

**Key Takeaway**: Algorithms that maintain memory locality, use fixed-size data types, and avoid dynamic allocation perform best on modern CPUs.

---

## Profile Files for Further Analysis

- **CPU Profiles**: `CPU.*.cpuprofile` (Chrome DevTools compatible)
- **Heap Profiles**: `Heap.*.heapprofile` (Chrome DevTools compatible)

To analyze these files:
```bash
# Open Chrome DevTools
# Navigate to Performance/Memory tab
# Load the .cpuprofile or .heapprofile files
```
