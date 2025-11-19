// Quick script to set a user's trial count for testing
const fs = require('fs');

const TRIALS_FILE = './trials.json';

// Get user ID from command line
const userId = process.argv[2];
const trialCount = parseInt(process.argv[3]) || 3;

if (!userId) {
  console.log('Usage: node test-trials.js <user_id> [trial_count]');
  console.log('Example: node test-trials.js 123456789 3');
  process.exit(1);
}

// Load existing trials
let trialsData = {};
if (fs.existsSync(TRIALS_FILE)) {
  trialsData = JSON.parse(fs.readFileSync(TRIALS_FILE, 'utf8'));
}

// Set user's trial count
trialsData[userId] = {
  count: trialCount,
  games: Array(trialCount).fill(null).map((_, i) => ({
    gameId: 'test',
    timestamp: Date.now() - (i * 1000)
  })),
  lastReset: Date.now()
};

// Save
fs.writeFileSync(TRIALS_FILE, JSON.stringify(trialsData, null, 2));

console.log(`✅ Set user ${userId} to ${trialCount}/3 trials used`);
console.log(`📊 Trials remaining: ${3 - trialCount}/3`);
console.log(`💾 Saved to ${TRIALS_FILE}`);
console.log('\n🔄 Restart the bot to apply changes!');
