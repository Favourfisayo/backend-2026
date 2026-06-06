// Single-threaded execution - No worker threads
// This runs on the main thread only, blocking all other operations

function BlockingFunctionWithoutThreads() {
    console.log("Starting single-threaded execution...");
    const startTime = Date.now();
    
    let counter = 0;

    for (let i = 0; i < 20_000_000_000; i++) {
        counter++;
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`Counter: ${counter}`);
    console.log(`Execution time: ${duration.toFixed(2)} seconds`);
}

BlockingFunctionWithoutThreads();
