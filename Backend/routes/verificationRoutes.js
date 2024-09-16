const express = require('express');
const router = express.Router();
const emailVerificationController = require('../controllers/verification/emailVerificationController');

// Email verification route
router.post('/email', emailVerificationController.sendEmailVerification);

// Route for code verification
router.get('/code-verification', emailVerificationController.verificationCode); 

//this route verifies and moves the user from Pending Users to the main database Users table
router.get('/verify-and-move', emailVerificationController.verifyAndMoveUser)

//possibly removable. Check all endpoints
router.get('/verify', emailVerificationController.verifyToken);

module.exports = router;
