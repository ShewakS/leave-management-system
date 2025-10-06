const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String },
  action: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  remarks: { type: String },
  at: { type: Date, default: Date.now }
});

const LeaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  type: { type: String, enum: ['Medical','Personal','Academic','Other'], default: 'Personal' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  document: { type: String }, // file path
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  approvals: [ApprovalSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

LeaveSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Leave', LeaveSchema);
