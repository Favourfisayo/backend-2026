/**
 * Column-Major Order Traversal - Cache-Unfriendly Approach
 * 
 * This script demonstrates column-major order traversal of a 2D array stored in memory.
 * Column-major means we access elements column by column (inner loop iterates rows).
 * This is cache-UNFRIENDLY because we jump across memory in large strides.
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

console.log('Starting column-major traversal (cache-unfriendly)...');

// Start timing
const startTime = process.hrtime.bigint();

// Column-major order traversal (outer loop = columns, inner loop = rows)
// This is CACHE-UNFRIENDLY because:
// - We access A[0], A[N], A[2*N], A[3*N], ... (jumping by N elements)
// - Each access is N*8 bytes apart (for Float64Array with N=10,000, that's 80KB apart!)
// - Cache lines (~64 bytes) cannot help us; each access likely causes a cache miss
// - Results in frequent trips to main memory (much slower than CPU cache)
let sum2 = 0;
for (let j = 0; j < N; j++) {
  for (let i = 0; i < N; i++) {
    // Access elements with large strides: A[0*N + j], A[1*N + j], A[2*N + j], ...
    // Each access is ~80KB apart in memory (10,000 elements * 8 bytes)
    sum2 += A[i * N + j];
  }
}

// End timing
const endTime = process.hrtime.bigint();
const elapsedMs = Number(endTime - startTime) / 1_000_000;

// Output results
console.log(`\n--- Column-Major Traversal Results ---`);
console.log(`Sum: ${sum2}`);
console.log(`Execution time: ${elapsedMs.toFixed(2)} ms`);

