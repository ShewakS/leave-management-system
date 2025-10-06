const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const auth = require('../middleware/auth');

// Block demo/test accounts from logging in or being (re)registered.
// Can be overridden via env var BLOCKED_LOGIN_EMAILS (comma-separated list)
const blockedLoginEmails = (process.env.BLOCKED_LOGIN_EMAILS || 'student@example.com,teacher@example.com,demo@example.com')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function isBlockedEmail(email) {
  return blockedLoginEmails.includes(String(email || '').toLowerCase());
}

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password, role, department, rollNo } = req.body;
  try {
    if (isBlockedEmail(email)) return res.status(403).json({ msg: 'Registration using demo/test email is disabled' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    // Newly created users are inactive by default; Admin must activate.
    // Exception: when creating an Admin account, activate immediately so they can manage others.
    const isAdmin = role === 'Admin';
    user = new User({ name, email, password: hashed, role, department, rollNo, isActive: isAdmin });
    await user.save();
    if (isAdmin) {
      const payload = { user: { id: user._id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
      return res.json({ token, msg: 'Admin account created.' });
    }
    // Non-admin must wait for activation
    res.json({ msg: 'Account created. Waiting for admin activation.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    if (isBlockedEmail(email)) return res.status(403).json({ msg: 'Login using demo/test account is disabled' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ msg: 'Account is not active. Contact admin.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
