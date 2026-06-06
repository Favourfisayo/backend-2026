export default function notFound(req, res) {
        res.statusCode = 404
        res.write(JSON.stringify({message: "route not found"}))
        res.end() 
}