import http from "http"
import fs from "fs/promises"
import url from "url"
import path from "path"
const PORT = process.env.PORT
const server = http.createServer(async (req, res) => {
    // res.write("Hello world!")
    // res.setHeader("Content-Type", "text/html")
    // res.statusCode = 404
    // console.log(req.url, req.method)

    const __filename = url.fileURLToPath(import.meta.url)// returns the entire path of the current file (in this case server.js)
    const __dirname = path.dirname(__filename)// returns the directory of the current file.

    try {
    if(req.method === "GET") {
    let filePath
    if (req.url === "/" ) {
        filePath = path.join(__dirname, "public", "index.html")
        // res.writeHead(200, { "content-type": "text/html" })
        // res.end("<h1>homepage</h1>")
    } else if(req.url === "/about") {
        filePath = path.join(__dirname, "public", "about.html")
    } else {
        throw new Error("Not found")
    }
        const asset = await fs.readFile(filePath)
        res.setHeader("Content-Type", "text/html")
        res.write(asset)
        res.end()
    } else {
            throw new Error("Method not allowed")
    }
    }catch(error) {
         res.writeHead(500, { "content-type": "text/html" })
        res.end(`<h1>${error}</h1>`)
    }
})

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT} `)
})