// removeAdminApprovals.js
// Run from backend folder: node scripts/removeAdminApprovals.js
// This script removes any 'Admin' approval entries from existing Leave documents
// and recomputes the overall `status` based on remaining approvals.

require('dotenv').config();
const mongoose = require('mongoose');
const Leave = require('../src/models/Leave');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slms';

async function run(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for migration');
  try{
    const leaves = await Leave.find({ 'approvals.role': 'Admin' });
    console.log('Found', leaves.length, 'leaves with Admin approvals');
    for (const l of leaves){
      const beforeCount = l.approvals.length;
      // remove Admin approvals
      l.approvals = l.approvals.filter(a => a.role !== 'Admin');
      const afterCount = l.approvals.length;
      // recompute status
      if (l.approvals.some(a => a.action === 'Rejected')) l.status = 'Rejected';
      else if (l.approvals.some(a => a.action === 'Pending')) l.status = 'Pending';
      else l.status = 'Approved';
      await l.save();
      console.log(`Updated leave ${l._id}: approvals ${beforeCount} -> ${afterCount}, status -> ${l.status}`);
    }
    console.log('Migration complete');
  } catch(err){
    console.error('Migration error', err);
  } finally{
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
