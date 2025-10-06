// Simple seed helper (run via node scripts/seed.js)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function run(){
  const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slms';
  await mongoose.connect(MONGO);
  await User.deleteMany({});
  const pwd = await bcrypt.hash('password', 10);
  await User.create([{ name:'Alice Student', email:'student@example.com', password:pwd, role:'Student' },{ name:'Bob Teacher', email:'teacher@example.com', password:pwd, role:'Faculty' }]);
  console.log('Seeded users');
  process.exit(0);
}

run();
