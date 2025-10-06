require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slms';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Bootstrap admin if provided
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      try{
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        let admin = await User.findOne({ email: ADMIN_EMAIL });
        if (!admin) {
          const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
          admin = new User({ name:'Administrator', email: ADMIN_EMAIL, password: hashed, role:'Admin', isActive: true });
          await admin.save();
          console.log('Admin user created:', ADMIN_EMAIL);
        } else if (admin.role !== 'Admin' || !admin.isActive) {
          admin.role = 'Admin';
          admin.isActive = true;
          await admin.save();
          console.log('Admin user ensured active:', ADMIN_EMAIL);
        }
      } catch(err){ console.error('Admin bootstrap failed', err); }
    }
    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });
