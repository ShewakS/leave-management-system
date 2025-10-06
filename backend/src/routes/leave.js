const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const Leave = require('../models/Leave');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });

// Student applies for leave
router.post('/apply', auth, upload.single('document'), [
  body('reason').notEmpty().withMessage('reason is required'),
  body('startDate')
    .notEmpty().withMessage('startDate is required')
    .custom(v => !isNaN(Date.parse(v))).withMessage('startDate must be a valid date'),
  body('endDate')
    .notEmpty().withMessage('endDate is required')
    .custom(v => !isNaN(Date.parse(v))).withMessage('endDate must be a valid date')
], async (req, res) => {
  if (req.user.role !== 'Student') return res.status(403).json({ msg: 'Only students can apply' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try{
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });
    const { reason, startDate, endDate, type } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return res.status(400).json({ msg: 'endDate cannot be before startDate' });
    const leave = new Leave({ student: student._id, reason, startDate: start, endDate: end, type });
    if (req.file) leave.document = req.file.path;
    // initialize approvals: Faculty, HOD
    leave.approvals = [
      { role: 'Faculty', action: 'Pending' },
      { role: 'HOD', action: 'Pending' }
    ];
    await leave.save();
    res.json(leave);
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get leaves for current user (student: own, others: by role)
router.get('/', auth, async (req, res) => {
  try{
    const q = {};
    if (req.user.role === 'Student') q.student = req.user.id;
  // Faculty/HOD can filter by department or student
    // populate approvals.by so frontend can show approver names and actions
    const leaves = await Leave.find(q)
      .populate('student','name email department')
      .populate('approvals.by','name email');
    console.debug('[leave GET] returning', leaves.map(l=>({ id: l._id, status: l.status, approvals: l.approvals.map(a=>({ role: a.role, action: a.action, by: a.by && (a.by.name || a.by) })) })));
    res.json(leaves);
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Approve/Reject a leave (single or bulk via array)
router.post('/approve', auth, roles(['Faculty','HOD']), [
  body('leaveId').optional().isMongoId(),
  body('leaveIds').optional().isArray(),
  // validate each element in the array (if provided) is a mongo id
  body('leaveIds.*').optional().isMongoId(),
  body('action').isIn(['Approved','Rejected']),
], async (req, res) => {
  // log incoming body for easier debugging
  console.debug('[leave approve] req.body =', JSON.stringify(req.body));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.debug('[leave approve] validation errors =', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  let { leaveId, leaveIds, action, remarks } = req.body;
  // coerce leaveIds into an array of strings if possible
  let ids = [];
  if (Array.isArray(leaveIds)) ids = leaveIds.filter(Boolean);
  else if (typeof leaveIds === 'string' && leaveIds) ids = [leaveIds];
  else if (leaveId) ids = [leaveId];
  if (!ids.length) return res.status(400).json({ msg: 'No leave IDs provided' });
  try{
    const results = [];
    for (const id of ids){
      const leave = await Leave.findById(id);
      if (!leave) continue;
      // find first pending approval that matches role
  const roleName = req.user.role; // Faculty/HOD
      const appr = leave.approvals.find(a => a.role === roleName && a.action === 'Pending');
      if (!appr) continue;
      appr.by = req.user.id;
      appr.action = action;
      appr.remarks = remarks;
      appr.at = Date.now();
      // if any approval rejected -> status Rejected; if all approved -> Approved; else Pending
      if (action === 'Rejected') leave.status = 'Rejected';
      else {
        const pending = leave.approvals.some(a => a.action === 'Pending');
        leave.status = pending ? 'Pending' : 'Approved';
      }
  await leave.save();
  // populate student and approvals.by for the returned result
  const populated = await Leave.findById(leave._id).populate('student','name email department').populate('approvals.by','name email');
  results.push(populated || leave);
    }
    res.json({ updated: results.length, results });
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
