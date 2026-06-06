import url from "url"

const urlString = "https://api.context-ed.app/api/me?authToken=ejy...."

const urlObj = new URL(urlString)

console.log(url.format(urlObj))
console.log(import.meta.url)
console.log(url.fileURLToPath(import.meta.url))
console.log(urlObj.search)

const params = new URLSearchParams(urlObj.search)
params.append("limit", "10")
params.delete("limit")
console.log(params)
console.log(params.get("authToken"))
