const express = require('express');
const adminPasskeyController = require('../../controllers/admin/adminPasskeyController');
const router = express.Router();

// Generate registration challenge for passkey (used during setup)
router.get('/generate-registration-challenge', adminPasskeyController.generateRegistrationChallenge);

// Verify the passkey registration (called after the admin submits the biometric data)
router.post('/verify-registration', adminPasskeyController.verifyRegistration);

// Generate authentication challenge for login using passkey
router.get('/generate-authentication-challenge', adminPasskeyController.generateAuthenticationChallenge);

// Verify passkey login (used during passkey-based login)
router.post('/verify-authentication', adminPasskeyController.verifyAuthentication);

module.exports = router;
