const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../logger');

const signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    // Basic validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Normalize email
    email = String(email).trim().toLowerCase();

    // Validate role
    if (!['teacher', 'student', 'cr'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document; status default set in schema based on role
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    let approvalMsg = '';
    if (newUser.status === "pending") 
      approvalMsg = " Your account will be reviewed by an admin before you can login.";

    res.status(201).json({ 
      message: `User created successfully.${approvalMsg}`
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    email = String(email).trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check privileged role status: must be approved
    if ((user.role === 'teacher' || user.role === 'cr') && user.status !== 'approved') {
      return res.status(403).json({ message: `Your account is ${user.status}. Please wait for admin approval.` });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account was rejected by the admin.' });
    }

    // Create JWT token including userId and role
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // 1 week
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login };
