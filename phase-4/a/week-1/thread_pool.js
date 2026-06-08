const crypto = require("crypto");

const start = Date.now();

// Launch 5 pbkdf2 operations simultaneously
// Default thread pool has 4 workers, so the 5th one will have to wait
for (let i = 0; i < 5; i++) {
  crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, key) => {
    console.log(`Operation ${i + 1} done in ${Date.now() - start}ms`);
  });
}