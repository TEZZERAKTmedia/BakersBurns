const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendEmail'); // This is the email utility function that sends emails
const User = require('../models/user'); // Assuming you're using Sequelize or another ORM

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit code
};

// Generate a token (can be used for sign-up, settings, password reset, etc.)
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Controller function to handle sending a verification email
const sendEmailVerification = async (req, res) => {
  const { email, actionType } = req.body;

  try {
    console.log('Received email:', email, 'and actionType:', actionType);

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    let token;
    // Generate either a verification token or a 6-digit code based on actionType
    if (actionType === 'verification-code') {
      token = generateVerificationCode(); // Use the 6-digit code for verification code action
    } else {
      token = generateVerificationToken(); // Use the longer token for other actions
    }

    console.log('Generated token:', token);

    // Store the token in the database (associated with the user)
    const result = await User.update({ verificationToken: token }, { where: { email } });
    console.log('Token update result:', result);

    // Send the email with the token (or code) and action type
    const emailSent = await sendVerificationEmail(email, token, actionType);

    // Check if the email was successfully sent
    if (emailSent) {
      console.log('Verification email successfully sent to:', email);
      return res.status(200).json({ message: 'Verification email sent!' });
    } else {
      console.log('Failed to send verification email to:', email);
      throw new Error('Email sending failed');
    }
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    return res.status(500).json({ message: 'Error sending verification email.', error: error.message });
  }
};

// Function to verify the token and handle different action types
const verifyToken = async (req, res) => {
  const { email, token, actionType } = req.query;

  try {
    // Find the user by email and token
    const user = await User.findOne({ where: { email, verificationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.', verified: false });
    }

    // Handle the verification based on the actionType
    switch (actionType) {
      case 'sign-up':
        user.isVerified = true; // Mark user as verified
        // Clear the token ONLY AFTER successful verification
        user.verificationToken = null;
        await user.save();

        return res.status(200).json({
          message: 'Sign-up verification successful!',
          verified: true,
          redirectUrl: `${process.env.DEV_USER_URL}/settings`
        });

      case 'password-reset':
        return res.status(200).json({
          message: 'Password reset verification successful!',
          verified: true,
          redirectUrl: `${process.env.DEV_USER_URL}/reset-password?token=${token}`
        });

      case 'settings-change':
        user.isVerified = true;
        // Clear the token ONLY AFTER successful verification
        user.verificationToken = null;
        await user.save();

        return res.status(200).json({
          message: 'Settings change verification successful!',
          verified: true,
          redirectUrl: `${process.env.DEV_USER_URL}/settings`
        });

      case 'verification-code':
        // Verify the 6-digit code for this case
        if (token === user.verificationToken) {
          // Clear the code ONLY AFTER successful verification
          user.verificationToken = null;
          await user.save();

          return res.status(200).json({
            message: 'Code verification successful!',
            verified: true,
            redirectUrl: `${process.env.DEV_USER_URL}/code-verification`
          });
        } else {
          return res.status(400).json({ message: 'Invalid or expired verification code.', verified: false });
        }

      default:
        return res.status(400).json({ message: 'Invalid action type.', verified: false });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying token.', error: error.message, verified: false });
  }
  
};
const verificationCode = async (req, res) => {
  console.log('Verification request received:', req.query); // Add this to see incoming params
  const { email, token } = req.query;  // Changed 'verificationCode' to 'token'

  try {
    console.log(`Verifying email: ${email}, token: ${token}`);

    // Find the user by email and token
    const user = await User.findOne({ where: { email, verificationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.', verified: false });
    }

    // Clear the token and mark verification as successful
    user.verificationToken = null;
    await user.save();

    console.log('Verification successful for:', email);
    return res.status(200).json({ message: 'Code verification successful!', verified: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ message: 'Error verifying token.', verified: false });
  }
};


// Exporting the controller functions
module.exports = {
  sendEmailVerification,
  verifyToken,
  verificationCode
};
