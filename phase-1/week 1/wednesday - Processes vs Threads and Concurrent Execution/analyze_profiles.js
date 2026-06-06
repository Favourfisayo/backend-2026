const fs = require('fs');

console.log('============================================');
console.log('  CPU PROFILING ANALYSIS');
console.log('============================================\n');

// Main Thread Analysis
console.log('=== MAIN THREAD (Single-threaded) ===');
const mainCpu = JSON.parse(fs.readFileSync('profiling_results/main_thread/cpu/CPU.20260212.150722.556.0.001.cpuprofile'));
const mainDuration = (mainCpu.endTime - mainCpu.startTime) / 1000000;
console.log('CPU Samples:', mainCpu.samples.length);
console.log('Duration (s):', mainDuration.toFixed(2));
console.log('Nodes (Functions):', mainCpu.nodes.length);

// 2 Worker Threads Analysis
console.log('\n=== 2 WORKER THREADS ===');
const twoWorkerMain = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/cpu/CPU.20260212.150813.20368.0.001.cpuprofile'));
const twoWorker1 = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/cpu/CPU.20260212.150813.20368.1.002.cpuprofile'));
const twoWorker2 = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/cpu/CPU.20260212.150813.20368.2.003.cpuprofile'));
const twoDuration = (twoWorkerMain.endTime - twoWorkerMain.startTime) / 1000000;
const twoWorker1Duration = (twoWorker1.endTime - twoWorker1.startTime) / 1000000;
const twoWorker2Duration = (twoWorker2.endTime - twoWorker2.startTime) / 1000000;

console.log('Main Thread - CPU Samples:', twoWorkerMain.samples.length, '| Duration:', twoDuration.toFixed(2), 's');
console.log('Worker 1 - CPU Samples:', twoWorker1.samples.length, '| Duration:', twoWorker1Duration.toFixed(2), 's');
console.log('Worker 2 - CPU Samples:', twoWorker2.samples.length, '| Duration:', twoWorker2Duration.toFixed(2), 's');
console.log('Total CPU Samples:', twoWorkerMain.samples.length + twoWorker1.samples.length + twoWorker2.samples.length);
console.log('Max Worker Duration:', Math.max(twoWorker1Duration, twoWorker2Duration).toFixed(2), 's');

// 4 Worker Threads Analysis
console.log('\n=== 4 WORKER THREADS ===');
const fourWorkerMain = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/cpu/CPU.20260212.150847.19944.0.001.cpuprofile'));
const fourWorker1 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/cpu/CPU.20260212.150847.19944.1.002.cpuprofile'));
const fourWorker2 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/cpu/CPU.20260212.150847.19944.2.003.cpuprofile'));
const fourWorker3 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/cpu/CPU.20260212.150847.19944.3.004.cpuprofile'));
const fourWorker4 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/cpu/CPU.20260212.150847.19944.4.005.cpuprofile'));
const fourDuration = (fourWorkerMain.endTime - fourWorkerMain.startTime) / 1000000;
const fourWorker1Duration = (fourWorker1.endTime - fourWorker1.startTime) / 1000000;
const fourWorker2Duration = (fourWorker2.endTime - fourWorker2.startTime) / 1000000;
const fourWorker3Duration = (fourWorker3.endTime - fourWorker3.startTime) / 1000000;
const fourWorker4Duration = (fourWorker4.endTime - fourWorker4.startTime) / 1000000;

console.log('Main Thread - CPU Samples:', fourWorkerMain.samples.length, '| Duration:', fourDuration.toFixed(2), 's');
console.log('Worker 1 - CPU Samples:', fourWorker1.samples.length, '| Duration:', fourWorker1Duration.toFixed(2), 's');
console.log('Worker 2 - CPU Samples:', fourWorker2.samples.length, '| Duration:', fourWorker2Duration.toFixed(2), 's');
console.log('Worker 3 - CPU Samples:', fourWorker3.samples.length, '| Duration:', fourWorker3Duration.toFixed(2), 's');
console.log('Worker 4 - CPU Samples:', fourWorker4.samples.length, '| Duration:', fourWorker4Duration.toFixed(2), 's');
console.log('Total CPU Samples:', fourWorkerMain.samples.length + fourWorker1.samples.length + fourWorker2.samples.length + fourWorker3.samples.length + fourWorker4.samples.length);
console.log('Max Worker Duration:', Math.max(fourWorker1Duration, fourWorker2Duration, fourWorker3Duration, fourWorker4Duration).toFixed(2), 's');

// Heap Analysis
console.log('\n\n============================================');
console.log('  HEAP PROFILING ANALYSIS');
console.log('============================================\n');

console.log('=== MAIN THREAD (Single-threaded) ===');
const mainHeap = JSON.parse(fs.readFileSync('profiling_results/main_thread/heap/Heap.20260212.150928.16008.0.001.heapprofile'));
const mainHeapSize = mainHeap.head.selfSize || 0;
const mainTotalSize = calculateTotalSize(mainHeap.head);
console.log('Root Self Size:', (mainHeapSize / 1024).toFixed(2), 'KB');
console.log('Total Heap Size:', (mainTotalSize / 1024).toFixed(2), 'KB');
console.log('Samples:', mainHeap.samples ? mainHeap.samples.length : 0);

console.log('\n=== 2 WORKER THREADS ===');
const twoHeapMain = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/heap/Heap.20260212.151013.18672.0.001.heapprofile'));
const twoHeap1 = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/heap/Heap.20260212.151013.18672.1.002.heapprofile'));
const twoHeap2 = JSON.parse(fs.readFileSync('profiling_results/2_worker_threads/heap/Heap.20260212.151013.18672.2.003.heapprofile'));
console.log('Main Thread Heap Size:', (calculateTotalSize(twoHeapMain.head) / 1024).toFixed(2), 'KB');
console.log('Worker 1 Heap Size:', (calculateTotalSize(twoHeap1.head) / 1024).toFixed(2), 'KB');
console.log('Worker 2 Heap Size:', (calculateTotalSize(twoHeap2.head) / 1024).toFixed(2), 'KB');
console.log('Total Heap Usage:', ((calculateTotalSize(twoHeapMain.head) + calculateTotalSize(twoHeap1.head) + calculateTotalSize(twoHeap2.head)) / 1024).toFixed(2), 'KB');

console.log('\n=== 4 WORKER THREADS ===');
const fourHeapMain = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/heap/Heap.20260212.151040.5360.0.001.heapprofile'));
const fourHeap1 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/heap/Heap.20260212.151040.5360.1.002.heapprofile'));
const fourHeap2 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/heap/Heap.20260212.151040.5360.2.003.heapprofile'));
const fourHeap3 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/heap/Heap.20260212.151040.5360.3.005.heapprofile'));
const fourHeap4 = JSON.parse(fs.readFileSync('profiling_results/4_worker_threads/heap/Heap.20260212.151040.5360.4.004.heapprofile'));
console.log('Main Thread Heap Size:', (calculateTotalSize(fourHeapMain.head) / 1024).toFixed(2), 'KB');
console.log('Worker 1 Heap Size:', (calculateTotalSize(fourHeap1.head) / 1024).toFixed(2), 'KB');
console.log('Worker 2 Heap Size:', (calculateTotalSize(fourHeap2.head) / 1024).toFixed(2), 'KB');
console.log('Worker 3 Heap Size:', (calculateTotalSize(fourHeap3.head) / 1024).toFixed(2), 'KB');
console.log('Worker 4 Heap Size:', (calculateTotalSize(fourHeap4.head) / 1024).toFixed(2), 'KB');
console.log('Total Heap Usage:', ((calculateTotalSize(fourHeapMain.head) + calculateTotalSize(fourHeap1.head) + calculateTotalSize(fourHeap2.head) + calculateTotalSize(fourHeap3.head) + calculateTotalSize(fourHeap4.head)) / 1024).toFixed(2), 'KB');

// Performance Comparison
console.log('\n\n============================================');
console.log('  PERFORMANCE COMPARISON');
console.log('============================================\n');

console.log('Execution Times:');
console.log('  Main Thread:       37.59 seconds (baseline)');
console.log('  2 Worker Threads:  19.71 seconds (47.6% faster, 1.91x speedup)');
console.log('  4 Worker Threads:  12.82 seconds (65.9% faster, 2.93x speedup)');

console.log('\nSpeedup Analysis:');
console.log('  2 Threads vs 1:    ~2x speedup (near-linear scaling)');
console.log('  4 Threads vs 2:    ~1.54x speedup (diminishing returns)');
console.log('  4 Threads vs 1:    ~2.93x speedup (good but not 4x - overhead present)');

console.log('\nParallelism Efficiency:');
console.log('  2 Threads: 95.5% efficient (1.91/2 = 95.5%)');
console.log('  4 Threads: 73.3% efficient (2.93/4 = 73.3%)');

// Helper function
function calculateTotalSize(node) {
    if (!node) return 0;
    let total = node.selfSize || 0;
    if (node.children) {
        for (const child of node.children) {
            total += calculateTotalSize(child);
        }
    }
    return total;
}
