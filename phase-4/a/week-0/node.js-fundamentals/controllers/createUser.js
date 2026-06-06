export default function createUser(req, res, users) {
    let body = ''
    req.on("data", (chunk) => {
        body += chunk.toString()
    })

    req.on("end", () => {
        const newUser = JSON.parse(body)
        users.push(newUser)
        res.statusCode = 201
        res.write(JSON.stringify(newUser))
        res.end()
    })
}