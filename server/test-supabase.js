// Test Supabase Connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  console.log('\nRequired variables:');
  console.log('  - SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)\n');
  process.exit(1);
}

console.log('✅ Credentials found:');
console.log(`   URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`   Key: ${SUPABASE_KEY.substring(0, 20)}...`);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    // Test 1: Check if tables exist
    console.log('📊 Checking database tables...\n');
    
    const tables = ['profiles', 'trials', 'sessions', 'stakes'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            results[table] = '❌ Table does not exist - MIGRATION NEEDED';
          } else {
            results[table] = `⚠️ Error: ${error.message}`;
          }
        } else {
          results[table] = '✅ Table exists';
        }
      } catch (err) {
        results[table] = `❌ Error: ${err.message}`;
      }
    }
    
    // Display results
    for (const [table, status] of Object.entries(results)) {
      console.log(`   ${table.padEnd(15)}: ${status}`);
    }
    
    // Test 2: Test a simple query
    console.log('\n🔗 Testing connection...');
    const { data: health, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError && healthError.code === 'PGRST116') {
      console.log('   ⚠️ Connection works but tables need migration\n');
      console.log('📝 ACTION REQUIRED:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy contents from server/migrations.sql');
      console.log('   3. Paste and run in SQL Editor');
      console.log('   4. Copy contents from server/RLS_GUIDANCE.sql');
      console.log('   5. Paste and run in SQL Editor\n');
      return false;
    } else if (healthError) {
      console.log(`   ❌ Connection error: ${healthError.message}\n`);
      return false;
    } else {
      console.log('   ✅ Connection successful!\n');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes('Invalid API key')) {
      console.log('🔑 ISSUE: Invalid API key');
      console.log('   - Check SUPABASE_SERVICE_ROLE_KEY in .env');
      console.log('   - Get correct key from: Supabase Dashboard → Settings → API\n');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('🌐 ISSUE: Cannot reach Supabase URL');
      console.log('   - Check SUPABASE_URL in .env');
      console.log('   - Verify internet connection\n');
    }
    
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('✅ Backend should work! Try: npm run dev\n');
    process.exit(0);
  } else {
    console.log('❌ Backend needs setup. See instructions above.\n');
    process.exit(1);
  }
});

