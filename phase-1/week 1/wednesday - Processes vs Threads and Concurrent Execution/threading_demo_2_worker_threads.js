const {Worker} = require("worker_threads")
const THREAD_COUNT = 2 // this is a 2-core cpus ( 4 cores with hyperthreading) so we are actually using 2/4 of the cpu cores, increasing this to 4 would ensure full parallelism and all 4 logical cores would be use, however increasing this pass 4 would cause context switches between threads running per core leading to performance overhead.

function createWorker() {
    return new Promise((res, rej) => {
        const worker = new Worker("./workers-threads.js", {
            workerData: {thread_count: THREAD_COUNT}
        })

        worker.on("message", (data) => res(data))
        worker.on("error", (error) => rej(error))
    })
}


function NonBlockingFunction() {
    console.log("Hello world!")
}


async function BlockingFunctionWithThreads() {
    console.log("Starting multi-threaded execution with 2 worker threads...");
    const startTime = Date.now();
    
    const workerPromises = []

    for (let i = 0; i < THREAD_COUNT; i++) {
        workerPromises.push(createWorker())
    }

    const thread_results = await Promise.all(workerPromises)

    const total = thread_results[0] + thread_results[1]

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`Counter: ${total}`);
    console.log(`Execution time: ${duration.toFixed(2)} seconds`);
}

BlockingFunctionWithThreads()