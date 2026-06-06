const fs = require('fs/promises'); 

async function readFileAsync(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    console.log(data);
  } catch (error) {
    console.error('Error reading file:', error.message);
  }
}

readFileAsync('ai-agents instruction templates.txt');
