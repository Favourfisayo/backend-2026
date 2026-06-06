import util from "util"
import fs from "fs"

// Basic formatting
// const formatted = util.format('Hello, %s!', 'World');
// console.log(formatted); // 'Hello, World!'

// const multiFormatted = util.format(
//   'My name is %s. I am %d years old and I love %s.',
//   'Kai',
//   30,
//   'Node.js'
// );

// console.log(multiFormatted);

// const specifiers = util.format(
//   'String: %s, Number: %d, JSON: %j, Character: %c',
//   'hello',
//   42,
//   { name: 'Object' },
//   65  // ASCII code for 'A'
// );
// console.log(specifiers);

// const extra = util.format('Hello', 'World', 'from', 'Node.js');
// console.log(extra); // 'Hello World from Node.js'

//object inspection -- useful for debugging, node.js uses this internally for logging objects


// const obj = {
//   name: 'John',
//   age: 30,
//   hobbies: ['reading', 'coding'],
//   address: {
//     city: 'New York',
//     country: {"code": 1294}
//   },
//   toString() {
//     return `${this.name}, ${this.age}`;
//   }
// };
// // Default inspection
// // console.log(util.inspect(obj));

// // Custom options
// // console.log(util.inspect(obj, {
// //   colors: true, // Add ANSI color codes
// //   depth: 0, // Only inspect the first level
// //   showHidden: true, // Show non-enumerable properties
// //   compact: false, // Don't format objects on a single line
// //   showProxy: true, // Show proxy details
// //   maxArrayLength: 3, // Limit array elements displayed
// //   breakLength: 50, // Line break after 50 characters
// //   sorted: true // Sort object properties alphabetically
// // }));

// // const circular = { name: 'Circular' };
// // circular.self = circular;
// // console.log(util.inspect(circular));

// //promises and async utilities

// // Convert fs.readFile from callback-based to Promise-based
// const readFilePromise = util.promisify(fs.readFile);

// // Now we can use it with async/await or Promise chaining
// async function readFileExample() {
//   try {
//     // Using the promisified function
//     const data = await readFilePromise('package.json', 'utf8');
//     console.log('File content:', data.substring(0, 100) + '...');
    
//     // Error handling with try/catch
//     return 'File read successfully';
//   } catch (err) {
//     console.error('Error reading file:', err.message);
//     return 'Error reading file';
//   }
// }

// readFileExample().then(result => {
//   console.log('Result:', result);
// });

// // A Promise-based function
// async function fetchUserData(id) {
//   if (!id) {
//     throw new Error('ID is required');
//   }
  
//   // Simulate API request
//   return {
//     id,
//     name: `User ${id}`,
//     email: `user${id}@example.com`
//   };
// }

// // Convert to callback-based
// const fetchUserDataCallback = util.callbackify(fetchUserData);

// // Using the callback-based function
// fetchUserDataCallback(1, (err, user) => {
//   if (err) {
//     console.error('Error:', err);
//     return;
//   }
  
//   console.log('User data:', user);
// });

// // Error handling
// fetchUserDataCallback(null, (err, user) => {
//   if (err) {
//     console.error('Error occurred:', err.message);
//     return;
//   }
  
//   console.log('User data:', user); // This won't execute
// });

//type checking utilities

// Example values
// const values = [
//   'string',
//   123,
//   true,
//   Symbol('symbol'),
//   { key: 'value' },
//   [1, 2, 3],
//   null,
//   undefined,
//   () => {},
//   BigInt(123),
//   new Date(),
//   /regex/,
//   Buffer.from('buffer'),
//   new Error('error')
// ];

// // Check types for each value
// values.forEach(value => {
//   console.log(`Value: ${util.inspect(value)}`);
//   console.log(`- isArray: ${util.types.isArrayBuffer(value)}`);
//   console.log(`- isDate: ${util.types.isDate(value)}`);
//   console.log(`- isRegExp: ${util.types.isRegExp(value)}`);
//   console.log(`- isNativeError: ${util.types.isNativeError(value)}`);
//   console.log(`- isPromise: ${util.types.isPromise(value)}`);
//   console.log(`- isPrimitive: ${util.isPrimitive(value)}`);
//   console.log(`- isString: ${util.isString(value)}`);
//   console.log(`- isNumber: ${util.isNumber(value)}`);
//   console.log(`- isBoolean: ${util.isBoolean(value)}`);
//   console.log(`- isSymbol: ${util.types.isSymbol(value)}`);
//   console.log(`- isNull: ${value === null}`);
//   console.log(`- isUndefined: ${value === undefined}`);
//   console.log(`- isFunction: ${util.types.isFunction(value)}`);
//   console.log(`- isBuffer: ${Buffer.isBuffer(value)}`);
//   console.log('---');
// });

// JavaScript built-in types
// console.log('util.types.isDate(new Date()):',
//   util.types.isDate(new Date()));
// console.log('util.types.isRegExp(/test/):',
//   util.types.isRegExp(/test/));
// console.log('util.types.isPromise(Promise.resolve()):',
//   util.types.isPromise(Promise.resolve()));

// // Node.js-specific types
// console.log('util.types.isArrayBuffer(new ArrayBuffer(0)):',
//   util.types.isArrayBuffer(new ArrayBuffer(0)));
// console.log('util.types.isSharedArrayBuffer(new SharedArrayBuffer(0)):',
//   util.types.isSharedArrayBuffer(new SharedArrayBuffer(0)));
// console.log('util.types.isUint8Array(new Uint8Array()):',
//   util.types.isUint8Array(new Uint8Array()));

// // More advanced types
// console.log('util.types.isProxy(new Proxy({}, {})):',
//   util.types.isProxy(new Proxy({}, {})));
// console.log('util.types.isExternal(Requiring C++ binding):',
//   'Not demonstrated in this example');


//deprecation utilities

// Mark deprecated functions with util.deprecate()
// Provide clear migration instructions in the deprecation message
// Include a deprecation code for easier tracking
// Document the deprecation in your API docs
// Remove deprecated functionality in a future major version

// Original function
function oldFunction(x, y) {
  return x + y;
}

// Deprecate the function
const deprecatedFunction = util.deprecate(
  oldFunction,
  'oldFunction() is deprecated. Use newFunction() instead.',
  'DEP0001'
);

// New function
function newFunction(x, y) {
  return x + y;
}

// Using the deprecated function will show a warning
console.log('Result:', deprecatedFunction(5, 10));

// Using the new function
console.log('Result:', newFunction(5, 10));

// Managing Deprecation Warnings
// You can control the display of deprecation warnings using environment variables:

// # Show all deprecation warnings
// NODE_OPTIONS='--trace-deprecation'

// # Show only the first occurrence of each deprecation
// NODE_OPTIONS='--no-deprecation'

// # Silence all deprecation warnings
// NODE_OPTIONS='--no-warnings'

// # Turn deprecation warnings into exceptions
// NODE_OPTIONS='--throw-deprecation'


//debugging and development utilities

// util.debuglog(section)
// Creates a function that conditionally writes debug messages to stderr based on the NODE_DEBUG environment variable.

// This is a lightweight alternative to full-featured logging libraries.

// Best Practices for Debug Logging:

// Use descriptive section names that match your application's modules
// Include relevant context in debug messages
// Use string placeholders for better performance
// Keep debug messages concise but informative
// Consider the performance impact of computing values for debug messages

// Example Usage:

// // Enable debug logging for specific modules
// // NODE_DEBUG=app,db node your-app.js

// // In your application
// const debugApp = util.debuglog('app');
// const debugDB = util.debuglog('db');

// // These will only log when 'app' is in NODE_DEBUG
// debugApp('Application started with config: %j', config);

// // These will only log when 'db' is in NODE_DEBUG
// debugDB('Connected to database: %s', connectionString);

// // Enable all debug logs (not recommended in production)
// // NODE_DEBUG=* node your-app.js

const debugApp = util.debuglog('app');
const debugDB = util.debuglog('db');
const debugAuth = util.debuglog('auth');

// These messages only appear when NODE_DEBUG includes 'app'
debugApp('Application starting...');
debugApp('Configuration loaded from %j', { source: 'config.json' });

// These messages only appear when NODE_DEBUG includes 'db'
debugDB('Connected to database');
debugDB('Query executed: %s', 'SELECT * FROM users');

// These messages only appear when NODE_DEBUG includes 'auth'
debugAuth('User authenticated: %s', 'john.doe');

// To see these messages, run your app with:
// NODE_DEBUG=app,db node your-app.js
console.log('Application running normally (this always shows)');