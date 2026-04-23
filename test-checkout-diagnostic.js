#!/usr/bin/env node

/**
 * Checkout Diagnostic Test for Sparky
 * Tests the /api/checkout endpoint to diagnose payment integration issues
 */

import https from 'https';
import http from 'http';

// Configuration - replace with your Vercel deployment URL
let API_BASE_URL = 'http://localhost:3000';
if (process.env.VERCEL_URL) {
  API_BASE_URL = process.env.VERCEL_URL.includes('localhost') ? `http://${process.env.VERCEL_URL}` : `https://${process.env.VERCEL_URL}`;
}

console.log('💳 Sparky Checkout Diagnostic Test');
console.log('=====================================');
console.log(`Testing API at: ${API_BASE_URL}`);

if (!process.env.VERCEL_URL) {
  console.log('');
  console.log('⚠️  VERCEL_URL environment variable not set!');
  console.log('   Set it to your Vercel deployment URL:');
  console.log('   export VERCEL_URL=your-app-name.vercel.app');
  console.log('   Or run: VERCEL_URL=your-app-name.vercel.app node test-checkout-diagnostic.js');
  console.log('');
}

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
    // Test 1: Check if checkout API is reachable
    console.log('1. Testing checkout API availability...');
    const healthCheck = await testEndpoint('POST', '/api/checkout', {
      planId: 'STARTER',
      title: 'Test Plan',
      price: 29.99,
      email: 'test@example.com',
      userId: 'test-user-123'
    });

    console.log(`   Status: ${healthCheck.status}`);

    if (healthCheck.status === 200) {
      console.log('   ✅ Checkout API is reachable');
      if (healthCheck.data?.init_point) {
        console.log('   ✅ Mercado Pago init_point generated');
        console.log(`   Link: ${healthCheck.data.init_point.substring(0, 50)}...`);
      } else {
        console.log('   ⚠️  No init_point in response');
        console.log('   Response:', JSON.stringify(healthCheck.data, null, 2));
      }
    } else {
      console.log('   ❌ Checkout API failed');
      console.log(`   Error: ${healthCheck.data?.error || 'Unknown error'}`);
      if (healthCheck.data?.details) {
        console.log(`   Details: ${healthCheck.data.details}`);
      }
      if (healthCheck.data?.status) {
        console.log(`   Status type: ${healthCheck.data.status}`);
      }
      if (healthCheck.data?.supabase_status) {
        console.log(`   Supabase status: ${healthCheck.data.supabase_status}`);
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

    // Test 3: Check environment variables
    console.log('3. Checking environment configuration...');
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
    console.log('1. Vercel environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    console.log('2. Supabase Edge Function "create_preference" is deployed');
    console.log('3. Supabase function has correct permissions');
    console.log('4. Vercel function logs for /api/checkout');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
runTests();