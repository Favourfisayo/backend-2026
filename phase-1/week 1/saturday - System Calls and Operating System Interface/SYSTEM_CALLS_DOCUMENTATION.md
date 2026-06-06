# System Calls and Operating System Interface Documentation

## Overview
This document outlines all the system-level commands and OS APIs used in the `system_info.js` CLI tool for retrieving process information, system resources, running processes, and system uptime across different operating systems.

---

## 1. Process Information

### Purpose
Retrieve detailed information about the current running process (Node.js process).

### System Calls by Platform

#### **Windows**
```batch
wmic process where ProcessId={PID} get ProcessId,Name,WorkingSetSize,UserModeTime,KernelModeTime /FORMAT:LIST
```
- **Command**: `wmic` (Windows Management Instrumentation Command-line)
- **Description**: Queries process information by Process ID
- **Output**: Process ID, process name, working set size (memory), user mode time, kernel mode time
- **System Call Level**: WMI (Windows Management Instrumentation) API

#### **Linux**
```bash
ps -p {PID} -o pid,comm,%cpu,%mem,vsz,rss,etime
```
- **Command**: `ps` (Process Status)
- **Description**: Displays information about active processes
- **Output**: Process ID, command, CPU%, memory%, virtual memory size, resident set size, elapsed time
- **System Call Level**: Reads from `/proc` filesystem

#### **macOS**
```bash
ps -p {PID} -o pid,comm,%cpu,%mem,vsz,rss,etime
```
- **Command**: `ps` (Process Status)
- **Description**: Same as Linux, displays process information
- **Output**: Similar to Linux
- **System Call Level**: Uses `sysctl` and `kvm` (Kernel Virtual Memory) interfaces

### Node.js APIs Used
- `process.pid` - Current process ID
- `process.version` - Node.js version
- `process.memoryUsage()` - Memory usage statistics
  - `rss` (Resident Set Size): Total memory allocated
  - `heapTotal`: Total heap size
  - `heapUsed`: Actual heap used
  - `external`: C++ objects bound to JavaScript
- `process.uptime()` - Process uptime in seconds

---

## 2. System Resources (Real-time Monitoring)

### Purpose
Monitor CPU usage, memory usage, disk space, and system uptime in real-time (updates every 2 seconds).

### A. CPU Usage

#### **Windows**
```batch
wmic cpu get loadpercentage /FORMAT:LIST
```
- **Command**: `wmic cpu`
- **Description**: Gets current CPU load percentage
- **Output**: LoadPercentage=X (where X is 0-100)
- **System Call Level**: WMI queries hardware information
- **Underlying API**: Queries performance counters

#### **Linux**
```bash
top -bn1 | grep "Cpu(s)"
```
- **Command**: `top` (Table of Processes)
- **Description**: Displays real-time CPU usage statistics
- **Output**: CPU usage breakdown (user, system, idle, etc.)
- **System Call Level**: Reads from `/proc/stat`
- **Alternative**: `mpstat`, `cat /proc/loadavg`

#### **macOS**
```bash
top -l 1 | grep "CPU usage"
```
- **Command**: `top`
- **Description**: Shows CPU usage statistics
- **Output**: CPU usage percentages
- **System Call Level**: host_processor_info() system call

### Node.js APIs Used
- `os.cpus()` - Returns array of CPU cores with model and speed information
  - Model name
  - Speed (MHz)
  - Times (user, nice, sys, idle, irq)

### B. Memory Usage

#### **Windows**
```batch
wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /FORMAT:LIST
```
- **Command**: `wmic OS`
- **Description**: Retrieves physical memory information
- **Output**: 
  - `FreePhysicalMemory`: Available RAM in KB
  - `TotalVisibleMemorySize`: Total RAM in KB
- **System Call Level**: WMI Win32_OperatingSystem class
- **Underlying API**: GlobalMemoryStatusEx() Win32 API

#### **Linux**
```bash
free -m
```
- **Command**: `free`
- **Description**: Displays memory usage in megabytes
- **Output**: Total, used, free, shared, buff/cache, available memory
- **System Call Level**: Reads from `/proc/meminfo`
- **Alternative**: `cat /proc/meminfo`, `vmstat`

#### **macOS**
```bash
vm_stat
```
- **Command**: `vm_stat` (Virtual Memory Statistics)
- **Description**: Shows virtual memory statistics
- **Output**: Pages free, active, inactive, wired, etc.
- **System Call Level**: host_statistics() Mach system call
- **Alternative**: `top -l 1 | grep PhysMem`

### Node.js APIs Used
- `os.totalmem()` - Total system memory in bytes
- `os.freemem()` - Free system memory in bytes
- **System Call Level**: 
  - Windows: GlobalMemoryStatusEx()
  - Linux: sysinfo() system call
  - macOS: host_statistics()

### C. Disk Space

#### **Windows**
```batch
wmic logicaldisk get name,size,freespace /FORMAT:CSV
```
- **Command**: `wmic logicaldisk`
- **Description**: Gets logical disk information for all drives
- **Output**: Drive letter, total size, free space (in bytes)
- **System Call Level**: WMI Win32_LogicalDisk class
- **Underlying API**: GetDiskFreeSpaceEx() Win32 API

#### **Linux/macOS**
```bash
df -h
```
- **Command**: `df` (Disk Free)
- **Description**: Reports file system disk space usage
- **Output**: Filesystem, size, used, available, use%, mounted on
- **System Call Level**: 
  - Linux: statfs() or statvfs() system call
  - macOS: statfs() system call
- **Alternative**: `du -sh` for directory usage

---

## 3. List Running Processes

### Purpose
Display all currently running processes on the system.

### System Calls by Platform

#### **Windows**
```batch
tasklist /FO TABLE /NH
```
- **Command**: `tasklist`
- **Description**: Lists all running processes
- **Flags**: 
  - `/FO TABLE`: Format output as table
  - `/NH`: No header
- **Output**: Image name, PID, session name, session#, memory usage
- **System Call Level**: Queries Windows process snapshots
- **Underlying API**: 
  - CreateToolhelp32Snapshot()
  - Process32First() and Process32Next()
  - EnumProcesses() (PSAPI)
- **Alternative**: `wmic process list brief`

#### **Linux**
```bash
ps aux
```
- **Command**: `ps` with `aux` flags
- **Flags**:
  - `a`: All processes with terminal
  - `u`: User-oriented format
  - `x`: Processes without controlling terminals
- **Output**: User, PID, CPU%, MEM%, VSZ, RSS, TTY, STAT, START, TIME, COMMAND
- **System Call Level**: Reads from `/proc/[pid]/`
- **Alternative**: `top`, `htop`, `pgrep`

#### **macOS**
```bash
ps aux
```
- **Command**: `ps aux`
- **Description**: Same as Linux
- **Output**: Similar to Linux
- **System Call Level**: proc_listallpids() and proc_pidinfo()
- **Alternative**: `top -l 1`, Activity Monitor

---

## 4. System Uptime

### Purpose
Display how long the system has been running since last boot.

### System Calls by Platform

#### **Windows**

**Method 1: WMI**
```batch
wmic os get lastbootuptime /FORMAT:LIST
```
- **Command**: `wmic os`
- **Description**: Gets the last boot time of the operating system
- **Output**: LastBootUpTime in format YYYYMMDDHHmmss.mmmmmm+/-UUU
- **System Call Level**: WMI Win32_OperatingSystem class
- **Underlying API**: GetTickCount64() Win32 API

**Method 2: systeminfo**
```batch
systeminfo | findstr "System Boot Time"
```
- **Command**: `systeminfo` piped to `findstr`
- **Description**: Searches system information for boot time
- **Output**: System Boot Time: MM/DD/YYYY, HH:MM:SS AM/PM
- **Note**: Slower than WMI method

#### **Linux**
```bash
uptime -p
```
- **Command**: `uptime` with pretty format
- **Description**: Shows how long system has been running
- **Output**: "up X days, Y hours, Z minutes"
- **System Call Level**: Reads from `/proc/uptime`
- **Alternative**: `cat /proc/uptime`, `who -b`

**Alternative:**
```bash
uptime
```
- **Output**: Current time, uptime, users logged in, load average

#### **macOS**
```bash
uptime
```
- **Command**: `uptime`
- **Description**: Shows system uptime
- **Output**: Current time, uptime, users, load average
- **System Call Level**: sysctl() with KERN_BOOTTIME
- **Alternative**: `sysctl kern.boottime`

### Node.js APIs Used
- `os.uptime()` - System uptime in seconds
- **System Call Level**:
  - Windows: GetTickCount64()
  - Linux: sysinfo() system call (reads uptime field)
  - macOS: sysctl() with KERN_BOOTTIME

---

## Summary of Node.js Built-in Modules Used

### 1. `child_process` Module
```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
```

**Purpose**: Execute system commands and capture their output

**Methods Used**:
- `exec()`: Spawns a shell and executes command
  - Returns stdout and stderr as strings
  - Buffer size can be configured with `maxBuffer` option
  - Suitable for commands with limited output

**System Call Level**:
- Windows: CreateProcess() Win32 API
- Linux/macOS: fork() + exec() family of system calls

### 2. `os` Module
```javascript
const os = require('os');
```

**Purpose**: Provides operating system-related utility methods

**Methods Used**:
- `os.platform()`: Returns OS platform ('win32', 'linux', 'darwin')
- `os.cpus()`: Returns array of CPU information
- `os.totalmem()`: Total system memory
- `os.freemem()`: Free system memory  
- `os.uptime()`: System uptime in seconds

### 3. `readline` Module
```javascript
const readline = require('readline');
```

**Purpose**: Provides interface for reading input from stdin line by line

**Usage**: Creating interactive CLI prompts

### 4. `util` Module
```javascript
const { promisify } = require('util');
```

**Purpose**: Convert callback-based functions to Promise-based

---

## Cross-Platform Compatibility Notes

### Platform Detection
```javascript
const platform = os.platform();
// Returns: 'win32' | 'linux' | 'darwin' | 'freebsd' | 'openbsd' | 'sunos' | 'aix'
```

### Command Differences

| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| **Process List** | `tasklist` | `ps aux` | `ps aux` |
| **CPU Info** | `wmic cpu` | `top`, `/proc/stat` | `top`, `sysctl` |
| **Memory Info** | `wmic OS` | `free`, `/proc/meminfo` | `vm_stat` |
| **Disk Info** | `wmic logicaldisk` | `df -h` | `df -h` |
| **Uptime** | `wmic os` | `uptime`, `/proc/uptime` | `uptime`, `sysctl` |

### Important Considerations

1. **Buffer Size**: Some commands produce large output (e.g., process lists)
   - Use `maxBuffer` option in `exec()`: `{ maxBuffer: 1024 * 1024 * 10 }`
   
2. **Output Parsing**: Different platforms have different output formats
   - Use regex patterns to extract data
   - Handle cases where commands might fail
   
3. **Permissions**: Some system commands may require elevated privileges
   - Most read-only operations work without admin/root
   - Write operations typically need elevation

4. **Performance**: System calls have overhead
   - Cache results when appropriate
   - Use asynchronous operations to prevent blocking

---

## Real-time Implementation Details

### Update Mechanism
```javascript
const displayResources = async () => {
  // Display current data
  console.clear();
  // ... fetch and display system info ...
  
  // Schedule next update
  if (updateCount < maxUpdates) {
    setTimeout(displayResources, 2000);
  }
};
```

**Features**:
- Updates every 2 seconds
- Clears console for fresh display
- Runs for 30 seconds (15 updates)
- Shows timestamp with each update
- Non-blocking (async/await pattern)

---

## Error Handling

All functions implement try-catch blocks to handle:
- Command execution failures
- Permission denied errors
- Platform-specific command unavailability
- Output parsing errors
- Buffer overflow (large outputs)

Example:
```javascript
try {
  const { stdout } = await execPromise(command);
  // Process output
} catch (error) {
  return `Error: ${error.message}`;
}
```

---

## Testing the CLI Tool

### Run the program:
```bash
node system_info.js
```

### Test each option:
1. **Option 1**: View current process information
2. **Option 2**: Watch real-time system resources (30 seconds)
3. **Option 3**: List all running processes
4. **Option 4**: Display system uptime
5. **Option 5**: Exit the program

---

## Future Enhancements

Possible improvements:
1. Add network statistics (active connections, bandwidth usage)
2. Implement continuous monitoring with graceful exit (Ctrl+C handler)
3. Add process filtering and search functionality
4. Export data to JSON/CSV format
5. Add historical data tracking and graphing
6. Implement alerts for resource thresholds
7. Add GPU information (for systems with dedicated graphics)

---

## References

### Windows
- [Windows Management Instrumentation (WMI)](https://docs.microsoft.com/en-us/windows/win32/wmisdk/)
- [Windows System Commands](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/)
- [Win32 API Documentation](https://docs.microsoft.com/en-us/windows/win32/api/)

### Linux
- [Linux man pages - ps](https://man7.org/linux/man-pages/man1/ps.1.html)
- [Linux /proc filesystem](https://man7.org/linux/man-pages/man5/proc.5.html)
- [Linux system calls](https://man7.org/linux/man-pages/man2/syscalls.2.html)

### macOS
- [macOS man pages](https://ss64.com/osx/)
- [Darwin/XNU kernel docs](https://opensource.apple.com/source/xnu/)

### Node.js
- [Node.js child_process documentation](https://nodejs.org/api/child_process.html)
- [Node.js os module documentation](https://nodejs.org/api/os.html)
- [Node.js process documentation](https://nodejs.org/api/process.html)

---

**Date**: February 14, 2026
**Topic**: System Calls and Operating System Interface
