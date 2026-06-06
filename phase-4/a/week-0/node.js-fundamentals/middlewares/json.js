export default function jsonMiddleware(req, res, next) {
    res.setHeader("content-type", "application/json")
    next()
}