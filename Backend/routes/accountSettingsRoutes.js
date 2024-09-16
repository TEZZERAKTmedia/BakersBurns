// accountSettingsRoutes.js
const express = require('express');
const router = express.Router();
const { resetPassword } = require('../controllers/verification/accountSettingsController'); // Correct destructuring

// Reset Password Route - Reset the password using the shared token
router.post('/reset-password', resetPassword); // Now `resetPassword` is a function

module.exports = router;
