const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.get('/ping', (req, res) => {
  res.send('Auth route is working');
});

router.post('/signup', signup);
router.post('/login', login);

console.log('Auth routes loaded');
module.exports = router;
