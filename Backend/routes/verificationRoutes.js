const express = require('express');
const router = express.Router();
const emailVerificationController = require('../controllers/emailVerificationController');

// Email verification route
router.post('/email', emailVerificationController.sendEmailVerification);

// Token verification route
router.get('/verify', emailVerificationController.verifyToken);

module.exports = router;
