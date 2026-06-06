/**
 * Memory Allocation and Monitoring Program
 * 
 * Purpose: This program demonstrates virtual memory concepts by:
 * - Allocating increasingly large arrays/buffers
 * - Monitoring memory usage at each allocation step
 * - Creating memory pressure to observe system behavior
 * - Logging memory statistics and performance metrics
 * 
 * Virtual Memory Concepts Demonstrated:
 * - Physical RAM vs Virtual Memory usage
 * - Memory allocation patterns
 * - System behavior under memory pressure
 * - Potential swapping/paging activity
 */

const fs = require('fs');
const os = require('os');

// Configuration constants
const INITIAL_SIZE_MB = 10;        // Starting allocation size in MB
const INCREMENT_MB = 50;           // Increase by 50MB each step
const MAX_ITERATIONS = 100;        // Maximum number of allocation steps
const DELAY_MS = 500;              // Delay between allocations (ms)

// Storage for allocated arrays to prevent garbage collection
const allocatedArrays = [];

// Log file setup
const logFileName = 'memory_log.txt';
const logStream = fs.createWriteStream(logFileName, { flags: 'w' });

/**
 * Formats bytes into human-readable format (MB, GB)
 * @param {number} bytes - Number of bytes to format
 * @returns {string} Formatted string with units
 */
function formatBytes(bytes) {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
        return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
}

/**
 * Gets current system memory statistics
 * @returns {object} Memory statistics including total, free, and used memory
 */
function getMemoryStats() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = process.memoryUsage();
    
    return {
        systemTotal: totalMem,
        systemFree: freeMem,
        systemUsed: usedMem,
        systemUsedPercent: ((usedMem / totalMem) * 100).toFixed(2),
        processHeapUsed: usage.heapUsed,
        processHeapTotal: usage.heapTotal,
        processRSS: usage.rss,           // Resident Set Size - physical memory
        processExternal: usage.external,  // Memory used by C++ objects
        processArrayBuffer: usage.arrayBuffers || 0
    };
}

/**
 * Logs memory statistics to both console and file
 * @param {string} message - Message to log
 * @param {object} stats - Memory statistics object
 * @param {number} iteration - Current iteration number
 * @param {number} allocatedMB - Size of allocation in MB
 * @param {number} timeTaken - Time taken for allocation in ms
 */
function logMemoryInfo(message, stats, iteration, allocatedMB, timeTaken) {
    const timestamp = new Date().toISOString();
    const logEntry = `
${'='.repeat(80)}
[${timestamp}] Iteration ${iteration}: ${message}
${'-'.repeat(80)}
Allocation Size: ${allocatedMB} MB
Time Taken: ${timeTaken.toFixed(2)} ms

SYSTEM MEMORY:
  Total Memory:    ${formatBytes(stats.systemTotal)}
  Used Memory:     ${formatBytes(stats.systemUsed)} (${stats.systemUsedPercent}%)
  Free Memory:     ${formatBytes(stats.systemFree)}

PROCESS MEMORY:
  Heap Used:       ${formatBytes(stats.processHeapUsed)}
  Heap Total:      ${formatBytes(stats.processHeapTotal)}
  RSS (Physical):  ${formatBytes(stats.processRSS)}
  External:        ${formatBytes(stats.processExternal)}
  Array Buffers:   ${formatBytes(stats.processArrayBuffer)}

TOTAL ALLOCATED: ${formatBytes(allocatedArrays.reduce((sum, arr) => sum + arr.length * 8, 0))}
${'-'.repeat(80)}
`;
    
    console.log(logEntry);
    logStream.write(logEntry);
}

/**
 * Allocates a new array of specified size and fills it with data
 * This prevents the system from using sparse allocation optimizations
 * @param {number} sizeMB - Size in megabytes to allocate
 * @returns {Float64Array} Allocated and populated array
 */
function allocateMemory(sizeMB) {
    // Calculate number of Float64 elements (8 bytes each)
    const numElements = (sizeMB * 1024 * 1024) / 8;
    
    // Create the array
    const array = new Float64Array(numElements);
    
    // Fill the array with data to ensure actual memory allocation
    // (prevents lazy allocation optimizations)
    for (let i = 0; i < numElements; i += 1000) {
        array[i] = Math.random();
    }
    
    return array;
}

/**
 * Detects signs of memory pressure or system degradation
 * @param {object} currentStats - Current memory statistics
 * @param {object} previousStats - Previous memory statistics (or null)
 * @returns {string} Warning message if issues detected, empty string otherwise
 */
function detectMemoryPressure(currentStats, previousStats) {
    const warnings = [];
    
    // Check if system is running low on free memory (less than 10%)
    const freePercent = (currentStats.systemFree / currentStats.systemTotal) * 100;
    if (freePercent < 10) {
        warnings.push(`WARNING: Low system memory (${freePercent.toFixed(1)}% free)`);
    }
    
    // Check if heap is near its limit
    const heapUsagePercent = (currentStats.processHeapUsed / currentStats.processHeapTotal) * 100;
    if (heapUsagePercent > 90) {
        warnings.push(`WARNING: High heap usage (${heapUsagePercent.toFixed(1)}%)`);
    }
    
    // Check if RSS (physical memory) is very high
    if (currentStats.processRSS > 2 * 1024 * 1024 * 1024) { // 2GB
        warnings.push(`WARNING: Process using ${formatBytes(currentStats.processRSS)} physical memory`);
    }
    
    return warnings.join('\n');
}

/**
 * Main execution function
 * Performs iterative memory allocations with monitoring
 */
async function main() {
    console.log('Starting Memory Allocation and Monitoring Program');
    console.log(`Logging to: ${logFileName}`);
    console.log(`Initial allocation: ${INITIAL_SIZE_MB} MB`);
    console.log(`Increment per step: ${INCREMENT_MB} MB`);
    console.log(`Delay between steps: ${DELAY_MS} ms\n`);
    
    logStream.write('MEMORY ALLOCATION EXPERIMENT LOG\n');
    logStream.write(`Start Time: ${new Date().toISOString()}\n`);
    logStream.write(`System: ${os.platform()} ${os.arch()}\n`);
    logStream.write(`CPUs: ${os.cpus().length} x ${os.cpus()[0].model}\n\n`);
    
    let previousStats = null;
    let currentSizeMB = INITIAL_SIZE_MB;
    let iteration = 0;
    
    try {
        // Main allocation loop
        while (iteration < MAX_ITERATIONS) {
            iteration++;
            
            console.log(`\n>>> Starting allocation ${iteration}: ${currentSizeMB} MB...`);
            
            // Measure allocation time
            const startTime = Date.now();
            const newArray = allocateMemory(currentSizeMB);
            const timeTaken = Date.now() - startTime;
            
            // Store the array to prevent garbage collection
            allocatedArrays.push(newArray);
            
            // Get current memory statistics
            const currentStats = getMemoryStats();
            
            // Log the information
            logMemoryInfo(
                `Allocated ${currentSizeMB} MB`,
                currentStats,
                iteration,
                currentSizeMB,
                timeTaken
            );
            
            // Check for memory pressure
            const pressureWarning = detectMemoryPressure(currentStats, previousStats);
            if (pressureWarning) {
                console.log('\n' + pressureWarning);
                logStream.write('\n' + pressureWarning + '\n');
            }
            
            // Check if we should stop (very low memory)
            const freePercent = (currentStats.systemFree / currentStats.systemTotal) * 100;
            if (freePercent < 5) {
                console.log('\n!!! CRITICAL: Less than 5% system memory free. Stopping to prevent system instability.');
                logStream.write('\n!!! CRITICAL: Stopping due to low memory\n');
                break;
            }
            
            // Check for significant slowdown (potential swapping)
            if (timeTaken > 5000) { // More than 5 seconds for allocation
                console.log(`\n!!! NOTICE: Allocation took ${timeTaken.toFixed(0)} ms - possible swapping/paging activity`);
                logStream.write(`\n!!! NOTICE: Slow allocation detected - possible swapping\n`);
            }
            
            previousStats = currentStats;
            currentSizeMB += INCREMENT_MB;
            
            // Wait before next allocation
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
        
    } catch (error) {
        // Handle allocation failure (out of memory)
        console.error(`\n!!! ERROR: Memory allocation failed at iteration ${iteration}`);
        console.error(`Error: ${error.message}`);
        console.error(`Last successful allocation: ${(currentSizeMB - INCREMENT_MB)} MB`);
        
        logStream.write(`\n${'='.repeat(80)}\n`);
        logStream.write(`ERROR: Allocation failed at iteration ${iteration}\n`);
        logStream.write(`Error message: ${error.message}\n`);
        logStream.write(`Last successful size: ${currentSizeMB - INCREMENT_MB} MB\n`);
        
        // Get final memory state
        const finalStats = getMemoryStats();
        logMemoryInfo(
            'FINAL STATE (After Failure)',
            finalStats,
            iteration,
            currentSizeMB - INCREMENT_MB,
            0
        );
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('EXPERIMENT COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total iterations: ${iteration}`);
    console.log(`Total arrays allocated: ${allocatedArrays.length}`);
    console.log(`Total memory allocated: ${formatBytes(allocatedArrays.reduce((sum, arr) => sum + arr.length * 8, 0))}`);
    
    const finalStats = getMemoryStats();
    console.log(`\nFinal System Memory: ${formatBytes(finalStats.systemUsed)} used of ${formatBytes(finalStats.systemTotal)}`);
    console.log(`Final Process RSS: ${formatBytes(finalStats.processRSS)}`);
    console.log(`\nLog saved to: ${logFileName}`);
    
    logStream.write(`\n${'='.repeat(80)}\n`);
    logStream.write('EXPERIMENT SUMMARY\n');
    logStream.write(`End Time: ${new Date().toISOString()}\n`);
    logStream.write(`Total iterations: ${iteration}\n`);
    logStream.write(`Total arrays: ${allocatedArrays.length}\n`);
    logStream.write(`Total allocated: ${formatBytes(allocatedArrays.reduce((sum, arr) => sum + arr.length * 8, 0))}\n`);
    
    logStream.end();
    
    console.log('\nPress Ctrl+C to exit and release memory...');
}

// Start the program
main().catch(error => {
    console.error('Fatal error:', error);
    logStream.end();
    process.exit(1);
});
