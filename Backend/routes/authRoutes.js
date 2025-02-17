const express = require('express');
const { signup, verifyEmail, checkUserRole } = require('../controllers/verification/authController');
const { loginUser } = require('../controllers/verification/loginController');
const { loginAdmin } = require('../controllers/admin/adminLoginController');
const { checkUsernameAvailability } = require('../controllers/verification/checkUsernameController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const  {highSecurityRateLimiter ,lowSecurityRateLimiter} = require('../utils/rateLimiter')
//Middleware
const router = express.Router();

router.post('/signup', signup);

router.get('/verify', verifyEmail);

router.get('/get-user-role', userAuthMiddleware(), checkUserRole);

router.post('/login', lowSecurityRateLimiter('user-login'), loginUser);

router.post('/check-username', checkUsernameAvailability)

//Admin log in routes
router.post('/admin-login', highSecurityRateLimiter('admin-login'), loginAdmin);

module.exports = router;
