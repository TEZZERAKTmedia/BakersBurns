const express = require('express');
const { signup, verifyEmail } = require('../controllers/verification/authController');
const { loginUser } = require('../controllers/verification/loginController');
const { loginAdmin } = require('../controllers/admin/adminLoginController');
const { checkUsernameAvailability } = require('../controllers/verification/checkUsernameController');

//Middleware
const router = express.Router();

router.post('/signup', signup);

router.get('/verify', verifyEmail);

router.post('/login', loginUser);

router.post('/check-username', checkUsernameAvailability)

//Admin log in routes
router.post('/admin-login', loginAdmin);

module.exports = router;
