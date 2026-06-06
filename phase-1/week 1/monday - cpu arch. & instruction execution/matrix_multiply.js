// Matrix Multiplication

// Import high-resolution timer for accurate benchmarking
import { performance } from "node:perf_hooks";

// Matrix size: N × N (1000 × 1000 = 1 million elements per matrix)
const N = 1000; // tune this (500–1200 range)
// Use typed arrays for memory efficiency and potential SIMD optimization
const A = new Float64Array(N * N);
const B = new Float64Array(N * N);
const C = new Float64Array(N * N); // Result matrix

// Initialize matrices A and B with pseudo-random values
// Stored in row-major order (flattened 2D arrays)
for (let i = 0; i < N * N; i++) {
  A[i] = (i % 97) / 97; // Values between 0 and ~1
  B[i] = (i % 89) / 89; // Different pattern for B
}

// Cache-optimized matrix multiplication using i-k-j loop order
// This order improves cache locality by accessing C and B sequentially
function mul(A, B, C, N) {
  for (let i = 0; i < N; i++) {      // For each row of A
    const iN = i * N;                 // Cache row offset
    for (let k = 0; k < N; k++) {     // For each column of A / row of B
      const aik = A[iN + k];          // Load A[i][k] once
      const kN = k * N;               // Cache row offset for B
      for (let j = 0; j < N; j++) {   // For each column of B
        // Accumulate: C[i][j] += A[i][k] * B[k][j]
        C[iN + j] += aik * B[kN + j];
      }
    }
  }
}

// Start timing
const t0 = performance.now();
mul(A, B, C, N); // Perform matrix multiplication
const t1 = performance.now();

// Output execution time and checksum for verification
console.log("seconds:", (t1 - t0) / 1000);
console.log("checksum:", C[0] + C[N*N - 1]); // Sum of first and last elements
