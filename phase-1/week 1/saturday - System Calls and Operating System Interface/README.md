# System Info CLI Tool

A Node.js command-line tool that retrieves system information using OS-level system calls.

## Features

1. **Process Information** - Get current Node.js process details including PID, memory usage, and uptime
2. **Real-time System Resources** - Monitor CPU, memory, disk space with live updates every 2 seconds
3. **Running Processes** - List all currently running processes on the system
4. **System Uptime** - Display system boot time and how long the system has been running

## Requirements

- Node.js (v12 or higher)
- Works on Windows, Linux, and macOS

## Installation

No additional packages required! Uses only Node.js built-in modules:
- `child_process`
- `os`
- `readline`
- `util`

## Usage

Run the program:
```bash
node system_info.js
```

You'll see a menu:
```
Welcome to the System Info CLI, Select an option:
    1. get process info
    2. retrieve system resources (real-time)
    3. lists running processes
    4. displays system uptime
    5. exit
Enter your choice:
```

### Option 1: Process Information
Shows detailed information about the currently running Node.js process:
- Process ID (PID)
- Platform
- Node.js version
- Memory usage (heap, external, RSS)
- Process uptime
- System-specific process details

### Option 2: Real-time System Resources
Displays live system metrics that update every 2 seconds for 30 seconds:
- **CPU Usage**: Current load percentage and core information
- **Memory Usage**: Total, used, and free memory
- **Disk Space**: All drives with total, free, and used space
- **System Uptime**: Real-time uptime counter

### Option 3: Running Processes
Lists all currently running processes (first 50):
- Process name/image
- Process ID (PID)
- Memory usage
- Additional details depending on platform

### Option 4: System Uptime
Shows:
- System boot time
- Current time
- Total uptime (days, hours, minutes, seconds)

## System Calls Used

### Windows
- `wmic process` - Process information
- `wmic cpu get loadpercentage` - CPU usage
- `wmic OS get FreePhysicalMemory,TotalVisibleMemorySize` - Memory info
- `wmic logicaldisk get name,size,freespace` - Disk space
- `wmic os get lastbootuptime` - System uptime
- `tasklist` - List running processes

### Linux
- `ps aux` - Process information and list
- `top -bn1` - CPU usage
- `free -m` - Memory information
- `df -h` - Disk space
- `uptime -p` - System uptime

### macOS
- `ps aux` - Process information and list
- `top -l 1` - CPU usage
- `vm_stat` - Memory information
- `df -h` - Disk space
- `uptime` - System uptime

## Documentation

See [SYSTEM_CALLS_DOCUMENTATION.md](SYSTEM_CALLS_DOCUMENTATION.md) for detailed information about:
- All system calls used
- Platform-specific commands
- Underlying OS APIs
- Cross-platform compatibility notes
- Error handling strategies

## Example Output

### Process Info
```
=== CURRENT PROCESS INFORMATION ===

Process ID: 12345
Platform: win32
Node Version: v18.x.x
Memory Usage: { rss: 36864000, heapTotal: 6144000, ... }
Uptime: 1.23 seconds
...
```

### Real-time Resources
```
=== REAL-TIME SYSTEM RESOURCES ===
Update #3 - 10:30:45 AM

--- CPU USAGE ---
CPU Load: 15%
CPU Cores: 8
CPU Model: Intel(R) Core(TM) i7...

--- MEMORY USAGE ---
Total Memory: 16.00 GB
Used Memory: 8.45 GB
Free Memory: 7.55 GB
Memory Usage: 52.81%

--- DISK SPACE ---
Drive C::
  Total: 500.00 GB
  Free: 125.50 GB
  Used: 74.90%

--- SYSTEM UPTIME ---
System Boot Time: 2/14/2026, 8:00:00 AM
Current Time: 2/14/2026, 10:30:45 AM
Uptime: 0 days, 2 hours, 30 minutes, 45 seconds
```

## Notes

1. **Administrator/Root Access**: Most commands work without elevated privileges since they're read-only operations
2. **Performance**: System calls have slight overhead; real-time monitoring is limited to 30 seconds to balance informativeness with resource usage
3. **Cross-Platform**: The tool automatically detects your OS and uses appropriate system commands
4. **Buffer Size**: Configured to handle large outputs (up to 10MB for process lists)

## Learning Objectives

This project demonstrates:
- Using Node.js `child_process` to execute system commands
- Working with the `os` module for system information
- Cross-platform development and OS detection
- Asynchronous programming with async/await
- Real-time data updates using setTimeout
- Parsing and formatting system command outputs
- Error handling for system operations

## Future Enhancements

- Network statistics (bandwidth, active connections)
- Process search and filtering
- Export data to JSON/CSV
- Historical data tracking
- Resource usage alerts
- GPU information

## Author

Backend Engineering Roadmap - Phase 1, Week 1  
Topic: System Calls and Operating System Interface  
Date: February 14, 2026

## License

Educational project - Free to use and modify
