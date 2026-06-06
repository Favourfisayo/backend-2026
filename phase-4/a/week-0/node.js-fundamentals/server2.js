import {createServer} from "http"
import logger from "./middlewares/logger.js"
import jsonMiddleware from "./middlewares/json.js"
import getUsers from "./controllers/getUsers.js"
import getUsersById from "./controllers/getUserById.js"
import notFound from "./controllers/notFound.js"
import createUser from "./controllers/createUser.js"

const PORT = process.env.PORT

const users = [
    {id: 1, name: 'john doe'},
    {id: 2, name: 'jane doe'},
    {id: 3, name: 'jim doe'},
]

const server = createServer(async (req, res) => {
    await logger(req, res, () => {
        jsonMiddleware(req, res, () => {
            if(req.url === "/api/users" && req.method === "GET") {
                getUsers(req, res, users)
            } else if(req.url.match(/\api\/users\/([0-9]+)/) && req.method === "GET") {
                getUsersById(req, res, users)
            } else if(req.url === "/api/users" && req.method === "POST") {
                createUser(req, res, users)
            }
             else {
                notFound(req, res)
            }
        })
    }) 
})

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT} `)
})