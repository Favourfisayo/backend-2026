const fs = require("fs")

try {
    const data = fs.readFileSync('ai-agents instruction templates.txt', 'utf8');
    console.log(data);
} catch(err) {
    console.error('Error reading file:', err);
}