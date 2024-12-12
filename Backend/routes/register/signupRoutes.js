const express = require('express');
const router = express.Router();
const signupController = require('../../controllers/verification/signupController');
const signupPasskeyController = require('../../controllers/verification/signupPasskeyController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');

//
router.post('/', signupController.signup);
router.get('/resend-verifictation-email', signupController.resendVerificationEmail);
router.get('/create-account', signupController.createAccount); 
router.post('/generate-token', signupController.generateLoginTokenAndSetCookie);
router.post('/check-username', signupController.checkUsername);

router.get('/generate-registration-challenge', userAuthMiddleware, signupPasskeyController.generateRegistrationChallenge);

// POST request to verify passkey registration during signup
router.post('/verify-registration', userAuthMiddleware, signupPasskeyController.verifyRegistration);

module.exports = router;
