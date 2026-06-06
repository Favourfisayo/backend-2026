const readline = require('readline');
const { exec } = require('child_process');
const os = require('os');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Save the original question method before overriding
const originalQuestion = rl.question.bind(rl);

// Promisify readline question
rl.question = (query) => {
  return new Promise((resolve) => {
    originalQuestion(query, resolve);
  });
};

/**
 * FUNCTION 1: Get Process Information
 * 
 * System Calls Used:
 * - Windows: tasklist /FO CSV /NH /V
 *   Description: Lists all running processes with detailed information
 * 
 * - Linux/Mac: ps aux
 *   Description: Displays information about active processes
 */
async function getProcessInformation() {
  try {
    console.log('\n=== CURRENT PROCESS INFORMATION ===\n');
    
    const platform = os.platform();
    let command;
    
    if (platform === 'win32') {
      // Windows: Get current Node.js process info
      command = `wmic process where ProcessId=${process.pid} get ProcessId,Name,WorkingSetSize,UserModeTime,KernelModeTime /FORMAT:LIST`;
    } else if (platform === 'darwin' || platform === 'linux') {
      // Mac/Linux
      command = `ps -p ${process.pid} -o pid,comm,%cpu,%mem,vsz,rss,etime`;
    }
    
    const { stdout } = await execPromise(command);
    
    // Also show Node.js process info
    console.log(`Process ID: ${process.pid}`);
    console.log(`Platform: ${platform}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Memory Usage:`, process.memoryUsage());
    console.log(`Uptime: ${process.uptime().toFixed(2)} seconds`);
    console.log(`\nSystem Command Output:\n${stdout}`);
    
    return '\n--- End of Process Information ---';
  } catch (error) {
    return `Error getting process info: ${error.message}`;
  }
}

/**
 * FUNCTION 2: Get System Resources (Real-time)
 * 
 * System Calls Used:
 * - Windows: 
 *   - wmic cpu get loadpercentage (CPU usage)
 *   - wmic OS get FreePhysicalMemory,TotalVisibleMemorySize (Memory)
 *   - wmic logicaldisk get name,size,freespace (Disk space)
 *   - systeminfo | findstr "System Boot Time" (Uptime)
 * 
 * - Linux:
 *   - top -bn1 | grep "Cpu(s)" (CPU usage)
 *   - free -m (Memory)
 *   - df -h (Disk space)
 *   - uptime -p (Uptime)
 * 
 * - Mac:
 *   - top -l 1 | grep "CPU usage" (CPU usage)
 *   - vm_stat (Memory)
 *   - df -h (Disk space)
 *   - uptime (Uptime)
 */
async function getSystemResources() {
  console.log('\n=== REAL-TIME SYSTEM RESOURCES ===');
  console.log('(Updating every 2 seconds... Press Ctrl+C to stop)\n');
  
  const platform = os.platform();
  let updateCount = 0;
  const maxUpdates = 15; // Display for 30 seconds
  
  const displayResources = async () => {
    try {
      updateCount++;
      console.clear();
      console.log('\n=== REAL-TIME SYSTEM RESOURCES ===');
      console.log(`Update #${updateCount} - ${new Date().toLocaleTimeString()}\n`);
      
      // CPU Information
      console.log('--- CPU USAGE ---');
      if (platform === 'win32') {
        const { stdout: cpuOutput } = await execPromise('wmic cpu get loadpercentage /FORMAT:LIST');
        const cpuMatch = cpuOutput.match(/LoadPercentage=(\d+)/);
        const cpuUsage = cpuMatch ? cpuMatch[1] : 'N/A';
        console.log(`CPU Load: ${cpuUsage}%`);
      } else if (platform === 'linux') {
        const { stdout: cpuOutput } = await execPromise('top -bn1 | grep "Cpu(s)"');
        console.log(`CPU: ${cpuOutput.trim()}`);
      } else if (platform === 'darwin') {
        const { stdout: cpuOutput } = await execPromise('top -l 1 | grep "CPU usage"');
        console.log(`CPU: ${cpuOutput.trim()}`);
      }
      
      const cpus = os.cpus();
      console.log(`CPU Cores: ${cpus.length}`);
      console.log(`CPU Model: ${cpus[0].model}`);
      
      // Memory Information
      console.log('\n--- MEMORY USAGE ---');
      if (platform === 'win32') {
        const { stdout: memOutput } = await execPromise('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /FORMAT:LIST');
        const freeMatch = memOutput.match(/FreePhysicalMemory=(\d+)/);
        const totalMatch = memOutput.match(/TotalVisibleMemorySize=(\d+)/);
        
        if (freeMatch && totalMatch) {
          const freeMemKB = parseInt(freeMatch[1]);
          const totalMemKB = parseInt(totalMatch[1]);
          const usedMemKB = totalMemKB - freeMemKB;
          
          console.log(`Total Memory: ${(totalMemKB / 1024 / 1024).toFixed(2)} GB`);
          console.log(`Used Memory: ${(usedMemKB / 1024 / 1024).toFixed(2)} GB`);
          console.log(`Free Memory: ${(freeMemKB / 1024 / 1024).toFixed(2)} GB`);
          console.log(`Memory Usage: ${((usedMemKB / totalMemKB) * 100).toFixed(2)}%`);
        }
      } else if (platform === 'linux') {
        const { stdout: memOutput } = await execPromise('free -m');
        console.log(memOutput);
      } else if (platform === 'darwin') {
        const { stdout: memOutput } = await execPromise('vm_stat');
        console.log(memOutput.split('\n').slice(0, 5).join('\n'));
      }
      
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      console.log(`\nNode.js Memory API:`);
      console.log(`Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
      console.log(`Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
      
      // Disk Space Information
      console.log('\n--- DISK SPACE ---');
      if (platform === 'win32') {
        const { stdout: diskOutput } = await execPromise('wmic logicaldisk get name,size,freespace /FORMAT:CSV');
        const lines = diskOutput.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
        
        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 4 && parts[2] && parts[3]) {
            const drive = parts[1];
            const freeSpace = parseInt(parts[2]);
            const totalSpace = parseInt(parts[3]);
            
            if (!isNaN(freeSpace) && !isNaN(totalSpace) && totalSpace > 0) {
              const usedSpace = totalSpace - freeSpace;
              const usedPercent = ((usedSpace / totalSpace) * 100).toFixed(2);
              
              console.log(`Drive ${drive}:`);
              console.log(`  Total: ${(totalSpace / 1024 / 1024 / 1024).toFixed(2)} GB`);
              console.log(`  Free: ${(freeSpace / 1024 / 1024 / 1024).toFixed(2)} GB`);
              console.log(`  Used: ${usedPercent}%`);
            }
          }
        });
      } else {
        const { stdout: diskOutput } = await execPromise('df -h');
        console.log(diskOutput);
      }
      
      // System Uptime
      console.log('\n--- SYSTEM UPTIME ---');
      await displaySystemUptime(false);
      
      // Schedule next update
      if (updateCount < maxUpdates) {
        setTimeout(displayResources, 2000);
      } else {
        console.log('\n--- Real-time monitoring complete ---');
        console.log('Run option 2 again to continue monitoring.\n');
      }
      
    } catch (error) {
      console.error(`Error updating resources: ${error.message}`);
    }
  };
  
  await displayResources();
  
  // Return empty string since we're handling output in the function
  return '';
}

/**
 * FUNCTION 3: List Running Processes
 * 
 * System Calls Used:
 * - Windows: tasklist /FO TABLE
 *   Description: Lists all running processes in table format
 * 
 * - Linux/Mac: ps aux
 *   Description: Lists all running processes with detailed information
 */
async function listRunningProcesses() {
  try {
    console.log('\n=== RUNNING PROCESSES ===\n');
    
    const platform = os.platform();
    let command;
    
    if (platform === 'win32') {
      // Windows: Use tasklist
      command = 'tasklist /FO TABLE /NH';
    } else if (platform === 'darwin' || platform === 'linux') {
      // Mac/Linux: Use ps
      command = 'ps aux';
    }
    
    const { stdout } = await execPromise(command, { maxBuffer: 1024 * 1024 * 10 });
    
    // Show first 50 processes
    const lines = stdout.split('\n');
    console.log(`Total processes found: ${lines.length - 1}`);
    console.log('\nFirst 50 processes:\n');
    
    // if (platform === 'win32') {
    //   console.log('IMAGE NAME                     PID     MEM USAGE');
    //   console.log('================================================');
    // }
    
    console.log(lines.slice(0, 50).join('\n'));
    
    return '\n--- End of Process List ---';
  } catch (error) {
    return `Error listing processes: ${error.message}`;
  }
}

/**
 * FUNCTION 4: Display System Uptime
 * 
 * System Calls Used:
 * - Windows: systeminfo | findstr "System Boot Time"
 *   OR: wmic os get lastbootuptime
 *   Description: Gets the system boot time
 * 
 * - Linux: uptime -p
 *   Description: Shows how long the system has been running
 * 
 * - Mac: uptime
 *   Description: Shows system uptime
 */
async function displaySystemUptime(showHeader = true) {
  try {
    if (showHeader) {
      console.log('\n=== SYSTEM UPTIME ===\n');
    }
    
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: Get last boot time
      const { stdout } = await execPromise('wmic os get lastbootuptime /FORMAT:LIST');
      const match = stdout.match(/LastBootUpTime=(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
      
      if (match) {
        const bootTime = new Date(
          parseInt(match[1]), // year
          parseInt(match[2]) - 1, // month (0-indexed)
          parseInt(match[3]), // day
          parseInt(match[4]), // hour
          parseInt(match[5]), // minute
          parseInt(match[6])  // second
        );
        
        const now = new Date();
        const uptimeMs = now - bootTime;
        
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
        
        console.log(`System Boot Time: ${bootTime.toLocaleString()}`);
        console.log(`Current Time: ${now.toLocaleString()}`);
        console.log(`Uptime: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
      }
    } else if (platform === 'linux') {
      const { stdout } = await execPromise('uptime -p');
      console.log(`System Uptime: ${stdout.trim()}`);
      
      const { stdout: uptimeFull } = await execPromise('uptime');
      console.log(`Full Info: ${uptimeFull.trim()}`);
    } else if (platform === 'darwin') {
      const { stdout } = await execPromise('uptime');
      console.log(`System Uptime: ${stdout.trim()}`);
    }
    
    // Also show Node.js uptime from os module
    const uptimeSec = os.uptime();
    const days = Math.floor(uptimeSec / (60 * 60 * 24));
    const hours = Math.floor((uptimeSec % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptimeSec % (60 * 60)) / 60);
    
    console.log(`\nOS Module Uptime: ${days} days, ${hours} hours, ${minutes} minutes`);
    
    if (showHeader) {
      return '\n--- End of Uptime Information ---';
    }
  } catch (error) {
    console.log(`Error getting uptime: ${error.message}`);
    if (showHeader) {
      return '';
    }
  }
}

const main = async () => {
  const optionSelection = await rl.question(`Welcome to the System Info CLI, Select an option: \n
    1. get process info \n
    2. retrieve system resources (real-time) \n
    3. lists running processes \n
    4. displays system uptime \n
    5. exit \n
Enter your choice: `);
    
    switch (optionSelection.trim()) {
        case "1": 
            console.log(await getProcessInformation())
            break
        case "2": 
            await getSystemResources()
            break
        case "3": 
            console.log(await listRunningProcesses())
            break
        case "4":
            console.log(await displaySystemUptime())
            break
        case "5":
            console.log('\nGoodbye!');
            rl.close();
            return;
        default:
            console.log("invalid option")
    }
  
  rl.close();
};

main();