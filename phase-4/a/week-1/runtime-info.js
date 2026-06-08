const os = require("os")
console.log(process.versions)

console.log(os.cpus())

// let ans = 0
// for(i=0; i<=1_000_000; i++) {
//     ans += 1
//     console.log(ans)
// }
console.log(process.hrtime.bigint())
console.log(process.env.UV_THREADPOOL_SIZE)