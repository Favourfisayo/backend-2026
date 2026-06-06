//COMMONJS IMPORT SYNTAX

// const {getRandomNumber, printName} = require("./utils")

// console.log(`Rand: ${getRandomNumber()}`)
// console.log(printName("Favour"))

import getPosts, {getPost}  from "./postController.js";

console.log(getPosts(), getPost(3))