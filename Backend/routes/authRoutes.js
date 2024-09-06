const express = require('express');
const { signup, verifyEmail } = require('../controllers/authController');
const { loginUser } = require('../controllers/loginController');
const { loginAdmin } = require('../controllers/adminLoginController');
const { checkUsernameAvailability } = require('../controllers/checkUsernameController');
const router = express.Router();

router.post('/signup', signup);
router.get('/verify', verifyEmail);
router.post('/login', loginUser);
router.post('/check-username', checkUsernameAvailability)

//Admin log in routes
router.post('/admin-login', loginAdmin);

module.exports = router;
