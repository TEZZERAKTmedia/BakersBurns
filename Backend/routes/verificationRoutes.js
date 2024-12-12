const express = require('express');
const router = express.Router();
const emailVerificationController = require('../controllers/verification/emailVerificationController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');


// Email verification route
router.post('/email', userAuthMiddleware(), emailVerificationController.sendEmailVerification);

// Route for code verification
router.get('/code-verification', userAuthMiddleware(), emailVerificationController.verificationCode); 

//this route verifies and moves the user from Pending Users to the main database Users table
router.get('/verify-and-move',userAuthMiddleware(), emailVerificationController.verifyAndMoveUser)

//possibly removable. Check all endpoints
router.get('/verify', userAuthMiddleware(), emailVerificationController.verifyToken);



module.exports = router;
