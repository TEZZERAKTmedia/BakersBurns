const crypto = require('crypto');
const sendVerificationEmail = require('../../utils/buildEmail.js'); // This is the email utility function that sends emails
const User = require('../../models/user.js'); // Assuming you're using Sequelize or another ORM
const PendingUser = require('../../models/pendingUser.js');
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
  try {
    const email = req.user?.email; // Email from the middleware
    if (!email) {
      return res.status(400).json({ message: 'Email not found in the request.' });
    }

    const { actionType } = req.body;

    console.log('Authenticated user email:', email);

    // Check if the user exists in the database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate the token or verification code
    const token = actionType === 'verification-code'
      ? generateVerificationCode()
      : generateVerificationToken();

    // Save the token in the database
    await User.update({ verificationToken: token }, { where: { email } });

    // Send the email
    const emailSent = await sendVerificationEmail(email, token, actionType);

    if (emailSent) {
      return res.status(200).json({
        message: 'Verification email sent!',
        email, // Include the email in the response for frontend notifications
      });
    } else {
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
  try {
    const email = req.user.email; // Get email from userAuthMiddleware
    const { token } = req.query; // The verification code passed as a query param

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

const moveUserToMainTable = async (email) => {
  try {
    // Find the pending user by email
    const pendingUser = await PendingUser.findOne({ where: { email } });

    if (!pendingUser) {
      console.log('Pending user not found for email:', email);
      return { success: false, message: 'Pending user not found.' };
    }

    // Create a new user in the main Users table
    await User.create({
      username: pendingUser.userName,  // Mapping 'userName' from PendingUsers to 'username' in Users
      email: pendingUser.email,
      password: pendingUser.password, // Ensure password is already hashed in pendingUser
      phoneNumber: pendingUser.phoneNumber,
      isVerified: true,  // Mark user as verified
    });

    // Delete the pending user entry after moving to the main table
    await pendingUser.destroy();

    return { success: true, message: 'User moved to main table successfully.' };
  } catch (error) {
    console.error('Error moving user to main table:', error.message);
    return { success: false, message: 'Error moving user to main table.' };
  }
};


// Function to handle the email verification
const verifyAndMoveUser = async (req, res) => {
  const { email, token } = req.query;

  try {
    // Find the pending user by email and token
    const pendingUser = await PendingUser.findOne({ where: { email, verificationToken: token } });

    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid or expired token.', verified: false });
    }

    // Verify the token and move user to main table
    const result = await moveUserToMainTable(email);
    if (result.success) {
      return res.status(200).json({
        message: 'User successfully verified and moved to main table!',
        verified: true,
        redirectUrl: `${process.env.DEV_USER_URL}/login`, // Redirect user after verification
      });
    } else {
      return res.status(500).json({ message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying token.', error: error.message, verified: false });
  }
};


// Exporting the controller functions
module.exports = {
  sendEmailVerification,
  verifyToken,
  verificationCode,
  verifyAndMoveUser
};
