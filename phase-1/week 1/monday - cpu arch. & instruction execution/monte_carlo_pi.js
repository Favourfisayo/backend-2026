// Monte Carlo π (pure CPU, easy to scale)

// Import high-resolution timer for accurate benchmarking
import { performance } from "node:perf_hooks";

// Number of random points to generate (400 million iterations)
const ITER = 400_000_000; // tune this

// Start timing
const t0 = performance.now();
let inside = 0;

// Monte Carlo simulation: generate random points in a unit square
// and count how many fall inside a quarter circle
for (let i = 0; i < ITER; i++) {
  const x = Math.random(); // Random x coordinate [0, 1]
  const y = Math.random(); // Random y coordinate [0, 1]
  // Check if point is inside quarter circle (distance from origin ≤ 1)
  if (x * x + y * y <= 1) inside++;
}

// Estimate π using ratio: (points inside circle / total points) × 4
// This works because the area ratio of quarter circle to square is π/4
const pi = (4 * inside) / ITER;
const t1 = performance.now();

// Output the estimated value of π and execution time
console.log({ pi, seconds: (t1 - t0) / 1000 });
