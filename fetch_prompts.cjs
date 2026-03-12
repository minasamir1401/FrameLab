const https = require('https');

https.get('https://raphael.app/ar', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /example-images%2F(\d+)\.webp.*?<p[^>]*>([\s\S]*?)<\/p>/gs;
    const matches = data.matchAll(regex);
    const results = {};
    for (const match of matches) {
      if (!results[match[1]]) {
        results[match[1]] = match[2].trim();
      }
    }
    console.log(JSON.stringify(results, null, 2));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
