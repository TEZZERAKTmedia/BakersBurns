const express = require('express');
const router = express.Router();
const signupController = require('../controllers/verification/signupController');

// POST route for signing up users
router.post('/', signupController.signup); // Use just '/' since this route is mounted as '/sign-up'

// GET request for verifying the user's email
router.get('/verify-email', signupController.verifyEmail);

// GET request for verifying the user's email and moving them from PendingUsers to Users table
router.get('/verify-and-move', signupController.verifyAndMove); 

module.exports = router;
