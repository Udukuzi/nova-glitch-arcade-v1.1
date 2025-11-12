// Script to monitor bot and show user IDs
const fs = require('fs');

const TRIALS_FILE = './trials.json';

console.log('📊 Current Trial Data:\n');

if (fs.existsSync(TRIALS_FILE)) {
  const data = JSON.parse(fs.readFileSync(TRIALS_FILE, 'utf8'));
  
  if (Object.keys(data).length === 0) {
    console.log('❌ No users have played yet.\n');
    console.log('💡 Send /start to your bot to register your user ID.\n');
  } else {
    console.log('👥 Users who have used the bot:\n');
    Object.entries(data).forEach(([userId, trials]) => {
      console.log(`User ID: ${userId}`);
      console.log(`  Trials used: ${trials.count}/3`);
      console.log(`  Games played: ${trials.games.map(g => g.gameId).join(', ')}`);
      console.log('');
    });
  }
} else {
  console.log('❌ No trials.json file found.\n');
  console.log('💡 The bot needs to be running and someone needs to send /start first.\n');
}

console.log('📝 To find your Telegram user ID:');
console.log('   1. Send /start to your bot');
console.log('   2. Check the bot\'s PowerShell window');
console.log('   3. Look for: 🆕 New user XXXXXX\n');

console.log('🧪 To test trial gating:');
console.log('   node test-trials.js YOUR_USER_ID 3\n');
