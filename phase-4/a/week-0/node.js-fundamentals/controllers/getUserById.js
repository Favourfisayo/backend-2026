export default function getUsersById(req, res, users) {
        const id = req.url.split("/")[3]
        const user = users.find(user => user.id === parseInt(id))
        if(!user) {
        res.statusCode  = 404
        res.write(JSON.stringify({message: "user not found"}))
        } 
        else {
        res.write(JSON.stringify(user))
        }
        res.end()
}