// Test script to check Supabase connection and table access
// Run with: node --input-type=module --eval "$(cat test-supabase.js)"

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aluzklqouexuruppwumz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdXprbHFvdWV4dXJ1cHB3dW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjIzMDgsImV4cCI6MjA4MTYzODMwOH0.ChAxpI6gi7RX-W9XShu_21-q1diBfFBSsPgCs8S_o3Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test basic connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Auth session error:', sessionError.message);
      return;
    }
    console.log('✅ Auth session OK');

    // Test table access - try to select from users table
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);

    if (selectError) {
      console.error('❌ Error accessing users table:', selectError.message);
      console.error('Error details:', selectError);
      return;
    }
    console.log('✅ Users table accessible, found', users?.length || 0, 'records');

    // Test insert (but don't actually insert)
    const testData = {
      id: 'test_' + Date.now(),
      username: 'testuser',
      password: 'testpass',
      cpf: '12345678901',
      parent_email: 'test@example.com',
      profile_data: {
        id: 'test_' + Date.now(),
        name: 'Test User',
        age: 10,
        subscription: 'PRO',
        progress: { unlockedLevels: 1, stars: 0, creativeProjects: 0, totalBlocksUsed: 0, secretsFound: 0 },
        settings: { soundEnabled: true, musicEnabled: true },
        isGuest: false,
        lastActive: Date.now(),
      }
    };

    console.log('🔍 Testing insert...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([testData]);

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('✅ Insert test passed');
      // Clean up test data
      await supabase.from('users').delete().eq('id', testData.id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message || err);
  }
}

testSupabase();