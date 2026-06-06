// BigInt factorial

// Import high-resolution timer for accurate benchmarking
import { performance } from "node:perf_hooks";

// Calculate factorial using arbitrary-precision BigInt arithmetic
// This avoids overflow but grows memory usage with the result
function factorialBigInt(n) {
  let acc = 1n; // Initialize accumulator as BigInt (note the 'n' suffix)
  // Multiply all integers from 2 to n
  for (let i = 2n; i <= n; i++) acc *= i;
  return acc;
}

// Start timing
const t0 = performance.now();
// Calculate factorial of 200,000 (results in ~973,351 digit number)
const x = factorialBigInt(200_000n); // tune this
const t1 = performance.now();

// Output the number of digits in the result and execution time
console.log("digits:", x.toString().length);
console.log("seconds:", (t1 - t0) / 1000);
