import fs from "fs/promises"
async function writeLogs(log) {
    try {
           await fs.appendFile("./public/logs.txt", log)
       } catch (error) {
        console.log("[error]: failed to log..")
    }
}

export default async function logger(req, res, next) {
    await writeLogs(`[URL]: ${req.url}, [METHOD]: ${req.method}\n`)
    next()
}