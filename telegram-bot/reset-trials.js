// Reset all trials or specific user
const fs = require('fs');

const TRIALS_FILE = './trials.json';
const userId = process.argv[2];

if (userId) {
  // Reset specific user
  if (fs.existsSync(TRIALS_FILE)) {
    const trialsData = JSON.parse(fs.readFileSync(TRIALS_FILE, 'utf8'));
    if (trialsData[userId]) {
      delete trialsData[userId];
      fs.writeFileSync(TRIALS_FILE, JSON.stringify(trialsData, null, 2));
      console.log(`✅ Reset trials for user ${userId}`);
      console.log(`🎮 User now has 3/3 free trials`);
    } else {
      console.log(`❌ User ${userId} not found in trials file`);
    }
  }
} else {
  // Reset all trials
  if (fs.existsSync(TRIALS_FILE)) {
    fs.unlinkSync(TRIALS_FILE);
    console.log('✅ Deleted trials.json - All users reset!');
  } else {
    console.log('ℹ️ No trials.json file found');
  }
  console.log('🎮 All users will have 3/3 free trials');
}

console.log('\n🔄 Restart the bot to apply changes!');
