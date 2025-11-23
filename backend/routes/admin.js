const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get all pending privileged users (teacher, cr)
router.get('/pending-users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pendingUsers = await User.find({
      status: 'pending',
      role: { $in: ['teacher', 'cr'] }
    }).select('name email role status createdAt');
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve user by ID
router.post('/approve-user', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { status: 'approved' });
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject user by ID
router.post('/reject-user', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { status: 'rejected' });
    res.json({ message: 'User rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
