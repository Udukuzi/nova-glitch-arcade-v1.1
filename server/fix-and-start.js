// Auto-fix missing table and start backend
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n🔧 AUTO-FIXING BACKEND...\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTrialsTable() {
  console.log('📊 Creating missing trials table...\n');
  
  const createTableSQL = `
    create table if not exists trials (
      address text primary key references profiles(address) on delete cascade,
      plays_used integer default 0,
      last_play timestamptz default now(),
      created_at timestamptz default now()
    );

    create index if not exists idx_trials_address on trials(address);
    create index if not exists idx_trials_last_play on trials(last_play);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    // If RPC doesn't work, try direct SQL execution via Supabase REST API
    if (error) {
      console.log('⚠️ Trying alternative method...');
      
      // Use Supabase REST API to execute SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createTableSQL })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    console.log('✅ Table creation SQL prepared\n');
    
    // Verify table exists by trying to query it
    console.log('🔍 Verifying table exists...');
    const { data: testData, error: testError } = await supabase
      .from('trials')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('❌ Table still missing. Creating via direct SQL...');
      
      // Try using the SQL editor approach - we'll need user to run SQL
      console.log('\n⚠️ Auto-creation failed. Here\'s the SQL to run manually:\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(createTableSQL);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📝 Copy above SQL → Supabase Dashboard → SQL Editor → Run\n');
      return false;
    } else if (testError) {
      console.log(`⚠️ Error checking table: ${testError.message}`);
      return false;
    } else {
      console.log('✅ Trials table exists!\n');
      return true;
    }
    
  } catch (error) {
    console.log(`⚠️ Could not auto-create table: ${error.message}`);
    console.log('\n📝 Manual fix required. Run this SQL in Supabase SQL Editor:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(createTableSQL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return false;
  }
}

async function checkAllTables() {
  console.log('🔍 Verifying all required tables...\n');
  
  const tables = ['profiles', 'trials', 'sessions', 'stakes'];
  let allExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`   ${table.padEnd(15)}: ❌ Missing`);
        allExist = false;
      } else {
        console.log(`   ${table.padEnd(15)}: ✅ Exists`);
      }
    } catch (err) {
      console.log(`   ${table.padEnd(15)}: ❌ Error - ${err.message}`);
      allExist = false;
    }
  }
  
  console.log('');
  return allExist;
}

async function main() {
  // Check current status
  const tablesExist = await checkAllTables();
  
  if (!tablesExist) {
    // Try to create missing table
    const created = await createTrialsTable();
    
    if (!created) {
      console.log('\n❌ Could not auto-create table. Please run SQL manually.\n');
      console.log('📋 Quick fix:');
      console.log('   1. Open: https://supabase.com/dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Copy SQL from above');
      console.log('   4. Run it\n');
      process.exit(1);
    }
    
    // Re-check after creation
    await checkAllTables();
  }
  
  // Test connection
  console.log('🔗 Testing Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  
  if (error && error.code !== 'PGRST116') {
    console.log(`❌ Connection error: ${error.message}\n`);
    process.exit(1);
  }
  
  console.log('✅ All systems ready!\n');
  console.log('🚀 Starting backend server...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Start the backend
  const child = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
  });
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  // Don't exit - let the server run
}

main().catch(console.error);

