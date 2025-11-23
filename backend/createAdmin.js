// Script to create an admin user from the command line
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  const name = 'Admin'; // Change as needed
  const email = 'admin@gmail.com'; // Change as needed
  const password = 'Admin@adctpg'; // Change as needed
  const role = 'admin';

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new User({
    name,
    email,
    password: hashedPassword,
    role,
    status: 'approved',
  });
  await admin.save();
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
