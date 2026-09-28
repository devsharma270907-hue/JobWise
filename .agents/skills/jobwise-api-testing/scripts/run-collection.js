/**
 * Quick runner script to trigger the Postman collection run or verify local backend status.
 */
import http from 'http';

function checkBackendHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: 'unknown', raw: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

async function main() {
  console.log('🔍 Checking local backend health on port 5001...');
  try {
    const health = await checkBackendHealth();
    console.log('✅ Local backend is ONLINE:', health);
    console.log('\nPostman Run IDs:');
    console.log('Collection UID: 58529204-fb876ec8-4c54-46e0-a8e0-f18657c588ee');
    console.log('Environment UID: 58529204-5d32aac5-a8b7-4555-9d3c-020c460884f2');
  } catch (err) {
    console.error('❌ Backend is not running on port 5001! Start it with: npm run dev');
    process.exit(1);
  }
}

main();
