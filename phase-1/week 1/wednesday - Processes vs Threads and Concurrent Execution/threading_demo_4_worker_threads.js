const {Worker} = require("worker_threads");
const THREAD_COUNT = 4; // Using all 4 logical cores for full parallelism

function createWorker() {
    return new Promise((res, rej) => {
        const worker = new Worker("./workers-threads.js", {
            workerData: {thread_count: THREAD_COUNT}
        });

        worker.on("message", (data) => res(data));
        worker.on("error", (error) => rej(error));
    });
}

async function BlockingFunctionWithThreads() {
    console.log("Starting multi-threaded execution with 4 worker threads...");
    const startTime = Date.now();
    
    const workerPromises = [];

    for (let i = 0; i < THREAD_COUNT; i++) {
        workerPromises.push(createWorker());
    }

    const thread_results = await Promise.all(workerPromises);

    const total = thread_results.reduce((acc, val) => acc + val, 0);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`Counter: ${total}`);
    console.log(`Execution time: ${duration.toFixed(2)} seconds`);
}

BlockingFunctionWithThreads();
