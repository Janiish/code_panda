import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, role, name, location } = req.body;
    if (!phone || !role) return res.status(400).json({ error: 'Phone and role required' });

    let user = await User.findOne({ phone });
    const otp = '1234'; // Demo OTP
    const otpExpiry = new Date(Date.now() + 5 * 60000);
    const aadhaarHash = crypto.createHash('sha256').update(String(phone)).digest('hex');

    if (!user) {
      const avatarMap = { farmer: '👨‍🌾', aggregator: '🏢', retailer: '🏪', consumer: '📱' };
      const wallet = '0x' + [...Array(4)].map(() => Math.floor(Math.random() * 0xffff).toString(16)).join('') + '...';
      user = new User({ name: name || 'User', phone, role, location: location || '', wallet, aadhaarHash, avatar: avatarMap[role] || '👤', otp, otpExpiry });
      await user.save();
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      if (!user.aadhaarHash) user.aadhaarHash = aadhaarHash;
      await user.save();
    }
    res.json({ success: true, message: 'OTP sent successfully (demo: 1234)', role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'User not found. Send OTP first.' });

    // Accept any 4-digit OTP for demo
    if (otp.length !== 4) return res.status(400).json({ error: 'Enter a 4-digit OTP' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'agrichain-zk-hackathon-secret-2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name, role: user.role,
        location: user.location, phone: user.phone, wallet: user.wallet,
        avatar: user.avatar, crops: user.crops, type: user.type
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiry -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users?role=farmer
router.get('/users', auth, async (req, res) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).select('name role location avatar wallet type crops');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
