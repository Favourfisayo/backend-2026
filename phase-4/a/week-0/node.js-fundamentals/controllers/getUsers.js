export default function getUsers(req, res, users) {
        res.write(JSON.stringify(users))
        res.end() 
}