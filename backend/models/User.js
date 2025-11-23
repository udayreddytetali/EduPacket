const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['teacher', 'student', 'cr','admin'], 
    default: 'student', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: function() {
      // Teachers and CRs require approval, students are approved immediately
      return (this.role === 'teacher' || this.role === 'cr') ? 'pending' : 'approved';
    },
    required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
