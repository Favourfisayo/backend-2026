import path from "path"
import url from "url"
const filePath = "./dir/dir2/test.txt"

console.log(path.basename(filePath)) //basename()
console.log(path.dirname(filePath)) //dirname()
console.log(path.extname(filePath))

console.log(path.parse(filePath))

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath2 = path.join(__dirname, "dir1", "dir2", "file.txt")
console.log(filePath2) 

const filePath3 = path.resolve(__dirname, "dir1", "dir2", "file.txt")
console.log(filePath2) 

