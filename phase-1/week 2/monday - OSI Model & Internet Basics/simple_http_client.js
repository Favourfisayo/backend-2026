const https = require('https');

const options = {
  hostname: 'api.context-ed.app',
  path: '/api/me',
  method: 'GET',
};

const req = https.request(options, (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on('end', () => {
    console.log(data); // The full response body
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// For http.request(), you must call end() to send the request
req.end();
