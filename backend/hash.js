const bcrypt = require('bcrypt');

const password = 'Admin@adctpg'; // Replace with your desired admin password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});