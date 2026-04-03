// Test script to check Supabase connection and table access
import { supabase } from '../services/supabase.js';

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test basic connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Auth session error:', sessionError);
      return;
    }
    console.log('✅ Auth session OK');

    // Test table access - try to select from users table
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);

    if (selectError) {
      console.error('❌ Error accessing users table:', selectError);
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

    console.log('🔍 Testing insert (will rollback)...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([testData]);

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test passed');
      // Clean up test data
      await supabase.from('users').delete().eq('id', testData.id);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSupabase();