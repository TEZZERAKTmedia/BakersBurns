const express = require('express');
const router = express.Router();

const sendVerificationEmail = require('../utils/sendEmail');  // Correct import

router.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;

    // Generate token logic (JWT or your choice of token)
    const token = "generated-token-here";  // Replace with your token generation logic

    try {
        // Call the utility function to send the verification email
        const emailSent = await sendVerificationEmail(email, token);
        
        if (emailSent) {
            res.status(200).json({ message: 'Verification email sent!' });
        } else {
            res.status(500).json({ message: 'Failed to send verification email.' });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
