const express = require('express');
const { signup, verifyEmail } = require('../controllers/authController');
const { loginUser } = require('../controllers/loginController');
const router = express.Router();

router.post('/signup', signup);
router.get('/verify', verifyEmail);

router.post('/login', loginUser);

module.exports = router;
