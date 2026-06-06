// import fs from "fs"
import fs from "fs/promises"
//readFile() - callback

// fs.readFile("./public/test.txt", "utf-8", (err, data) => { 
//     if(err) throw err 
//     console.log(data)
//  })

//  //readFileSync() - Synchronous version
//  const data = fs.readFileSync("./public/test.txt", "utf-8")
//  console.log(data)

//readFile() - Promise .then()

// fs.readFile("./public/test.txt", "utf-8")
// .then((data) => console.log(data))
// .catch((err) => console.log(err))

//readFile() - async/await

async function readFile() {
    try {
        const data =  await fs.readFile("./public/test.txt", "utf-8")
        console.log(data)
    } catch (error) {
        console.log(error)
    }
}

//writeFile()

async function writeFile() {
    try {
        await fs.writeFile("./public/test.txt", "Hello, file written to")
        console.log("file written!")
    } catch (error) {
        console.log(error)
    }
}

//appendFile()

async function appendFile() {
    try {
        await fs.appendFile("./public/test.txt", "\nThis is appended text...")
        console.log("file appending to...")
    } catch (error) {
        
    }
}
appendFile()
readFile()