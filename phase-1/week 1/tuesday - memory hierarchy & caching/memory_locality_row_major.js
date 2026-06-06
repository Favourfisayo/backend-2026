/**
 * Row-Major Order Traversal - Cache-Friendly Approach
 * 
 * This script demonstrates row-major order traversal of a 2D array stored in memory.
 * Row-major means we access elements row by row (inner loop iterates columns).
 * This is cache-friendly because adjacent memory locations are accessed sequentially.
 */

// Configuration: Matrix size (N x N)
const N = 10_000;

// Create a 1D typed array to represent a 2D matrix (N x N)
// Float64Array provides better performance and fixed memory layout
// Total elements: N * N = 10,000 * 10,000 = 100,000,000
const A = new Float64Array(N * N);

console.log(`Initializing ${N}x${N} matrix (${(N * N * 8 / 1024 / 1024).toFixed(2)} MB)...`);

// Initialize the matrix with values
// Formula: A[i][j] = i * N + j maps 2D coordinates to 1D array index
for (let i = 0; i < N; i++) {
  for (let j = 0; j < N; j++) {
    A[i * N + j] = i * N + j;
  }
}

console.log('Starting row-major traversal (cache-friendly)...');

// Start timing
const startTime = process.hrtime.bigint();

// Row-major order traversal (outer loop = rows, inner loop = columns)
// This is CACHE-FRIENDLY because:
// - We access A[0], A[1], A[2], ... sequentially
// - Each memory access brings a cache line (~64 bytes) into CPU cache
// - Subsequent accesses hit the cache instead of main memory
let sum = 0;
for (let i = 0; i < N; i++) {
  // Pre-calculate base offset for current row (optimization)
  const base = i * N;
  
  for (let j = 0; j < N; j++) {
    // Access elements sequentially: A[base + 0], A[base + 1], A[base + 2], ...
    sum += A[base + j];
  }
}

// End timing
const endTime = process.hrtime.bigint();
const elapsedMs = Number(endTime - startTime) / 1_000_000;

// Output results
console.log(`\n--- Row-Major Traversal Results ---`);
console.log(`Sum: ${sum}`);
console.log(`Execution time: ${elapsedMs.toFixed(2)} ms`);
console.log(`Memory access pattern: Sequential (cache-friendly)`);
console.log(`Cache hit rate: HIGH - adjacent memory locations accessed together`);
