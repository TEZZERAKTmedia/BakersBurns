const express = require('express');
const { handleGoogleAuth, checkGoogleUserStatus, updateTermsAcceptance } = require('../../controllers/register/googleController'); // Import your controller

const router = express.Router();

router.post('/', handleGoogleAuth); // Endpoint for Google Sign-In
router.post('/check', checkGoogleUserStatus);
router.post('/accept-terms', updateTermsAcceptance);

module.exports = router;
