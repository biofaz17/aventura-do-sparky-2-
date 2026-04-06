#!/usr/bin/env node

/**
 * Diagnostic Test for Sparky Admin API
 * Tests the /api/users endpoint to diagnose issues with user creation and loading
 */

const https = require('https');
const http = require('http');

// Configuration - replace with your Vercel deployment URL
const API_BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

console.log('🔍 Sparky Admin API Diagnostic Test');
console.log('=====================================');
console.log(`Testing API at: ${API_BASE_URL}`);
console.log('');

async function testEndpoint(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path}`;
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Check if API is reachable
    console.log('1. Testing API availability...');
    const healthCheck = await testEndpoint('GET', '/api/users');
    console.log(`   Status: ${healthCheck.status}`);
    if (healthCheck.status === 200) {
      console.log('   ✅ API is reachable');
      console.log(`   Users loaded: ${healthCheck.data?.users?.length || 0}`);
    } else {
      console.log('   ❌ API not reachable');
      console.log(`   Response: ${healthCheck.raw}`);
      if (healthCheck.data?.error) {
        console.log(`   Error: ${healthCheck.data.error}`);
      }
    }
    console.log('');

    // Test 2: Check CORS headers
    console.log('2. Checking CORS headers...');
    if (healthCheck.headers['access-control-allow-origin']) {
      console.log('   ✅ CORS headers present');
    } else {
      console.log('   ❌ CORS headers missing');
    }
    console.log('');

    // Test 3: Test user creation (with test data)
    console.log('3. Testing user creation...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      password: 'testpass123',
      parent_email: 'test@example.com',
      name: 'Test User',
      age: 10,
      subscription: 'FREE'
    };

    try {
      const createResult = await testEndpoint('POST', '/api/users', testUser);
      console.log(`   Status: ${createResult.status}`);
      if (createResult.status === 201) {
        console.log('   ✅ User creation successful');
        console.log(`   Created user ID: ${createResult.data?.user?.id}`);
      } else {
        console.log('   ❌ User creation failed');
        console.log(`   Response: ${createResult.raw}`);
        if (createResult.data?.error) {
          console.log(`   Error: ${createResult.data.error}`);
          if (createResult.data.details) {
            console.log(`   Details: ${createResult.data.details}`);
          }
        }
      }
    } catch (err) {
      console.log('   ❌ Request failed');
      console.log(`   Error: ${err.message}`);
    }
    console.log('');

    // Test 4: Check environment variables
    console.log('4. Checking environment configuration...');
    if (process.env.SUPABASE_URL) {
      console.log('   ✅ SUPABASE_URL is set');
    } else {
      console.log('   ❌ SUPABASE_URL is missing');
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY is set');
    } else if (process.env.SUPABASE_ANON_KEY) {
      console.log('   ⚠️  Using SUPABASE_ANON_KEY (should use SERVICE_ROLE_KEY in production)');
    } else {
      console.log('   ❌ No Supabase key found');
    }
    console.log('');

    console.log('Diagnostic complete.');
    console.log('');
    console.log('If you see errors above, check:');
    console.log('1. Vercel environment variables');
    console.log('2. Supabase database permissions');
    console.log('3. Network connectivity');
    console.log('4. Vercel function logs');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
runTests();