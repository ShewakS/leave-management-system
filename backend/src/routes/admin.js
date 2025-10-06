const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// List users (basic fields)
router.get('/users', auth, roles(['Admin']), async (req, res) => {
  try{
    const users = await User.find({}, 'name email role isActive department rollNo createdAt');
    res.json(users);
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Activate/deactivate and change role
router.post('/users/:id', auth, roles(['Admin']), [
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['Student','Faculty','HOD','Admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try{
    const { id } = req.params;
    const { isActive, role } = req.body;
    const update = {};
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (role) update.role = role;
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;


