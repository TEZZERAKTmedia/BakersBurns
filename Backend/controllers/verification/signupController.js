const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PendingUser = require('../../models/pendingUser');
const User = require('../../models/user');
const Message = require('../../models/messages');
const sendVerificationEmail = require('../../utils/buildEmail'); // Nodemailer utility
const { v4: uuidv4 } = require('uuid');


// Signup Controller
const signup = async (req, res) => {
  const { userName, email, password, phoneNumber } = req.body;

  try {
    let existingUser = await PendingUser.findOne({ where: { email } });

    // Remove expired pending users (e.g., after 24 hours)
    if (existingUser) {
      const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const currentTime = new Date().getTime();
      const createdAtTime = new Date(existingUser.createdAt).getTime();

      if (currentTime - createdAtTime > expirationTime) {
        // Pending user is expired, delete it
        await PendingUser.destroy({ where: { email } });
        existingUser = null; // Proceed with sign-up as new user
      } else {
        // Resend verification email if still within 24 hours
        const verificationToken = existingUser.verificationToken;
        const emailResent = await sendVerificationEmail(email, verificationToken, 'sign-up');

        if (emailResent) {
          return res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
        } else {
          return res.status(500).json({ message: 'Error resending verification email.' });
        }
      }
    }

    // If no existing or expired user, proceed with sign-up
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a JWT token for email verification
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const emailSent = await sendVerificationEmail(email, verificationToken, 'sign-up');

    if (emailSent) {
      await PendingUser.create({
        userName,
        email,
        password: hashedPassword,
        phoneNumber,
        verificationToken, // Store the JWT token
        createdAt: new Date() // Store creation time for expiration check
      });

      return res.status(200).json({ message: 'Verification email sent. Please verify your email.' });
    } else {
      return res.status(500).json({ message: 'Error sending verification email.' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Signup failed.' });
  }
};

// Verify and Move Controller

const verifyAndMove = async (req, res) => {
  const { email, token } = req.query;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded email matches the provided email
    if (decoded.email !== email) {
      return res.status(400).json({ message: 'Invalid token or email mismatch.' });
    }

    // Find the pending user by email BEFORE deleting it
    const pendingUser = await PendingUser.findOne({ where: { email } });
    if (!pendingUser) {
      return res.status(404).json({ message: 'Pending user not found.' });
    }

    // Check if the user already exists in the Users table
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered. Please log in.',
        redirectUrl: process.env.LOGIN_URL || 'http://localhost:3010/login',
      });
    }

    // Move the user to the Users table
    const newUser = await User.create({
      username: pendingUser.userName,
      email: pendingUser.email,
      password: pendingUser.password,
      phoneNumber: pendingUser.phoneNumber,
      isVerified: true, // Mark the user as verified
    });

    // After successful move, delete the pending user entry
    await PendingUser.destroy({ where: { email } });

    // Generate an authentication token (JWT) for the verified user
    const authToken = jwt.sign({ id: newUser.id, email: newUser.email, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Find the admin user to initiate the messaging
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      return res.status(500).json({ message: 'Admin user not found.' });
    }

    // Generate a unique threadId for the messaging thread
    const threadId = uuidv4();

    // Create an initial message from the admin to the user
    await Message.create({
      threadId: threadId,
      senderUsername: adminUser.username,
      receiverUsername: newUser.username,
      messageBody: 'Hi, welcome to BakersBurns. How can I help?',
      createdAt: new Date(),
    });

    // Set a secure cookie for protecting future routes
    res.cookie('authToken', authToken, {
      httpOnly: true, // Prevent client-side access to cookie
      secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
      domain: process.env.COOKIE_DOMAIN || 'localhost', // Cross-subdomain, if needed
      maxAge: 60 * 60 * 1000, // 1-hour expiration
      sameSite: 'Lax', // Prevent CSRF attacks
    });

    // Respond with success and redirect URL
    return res.status(200).json({
      message: 'User verified, moved to Users table, and initial message created.',
      verified: true,
      redirectUrl: process.env.DEV_USER_URL || 'http://localhost:4001', // Redirect to user dashboard
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};


// Resend verification email controller
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await PendingUser.findOne({ where: { email } });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found or already verified' });
    }

    const verificationToken = existingUser.verificationToken;

    const emailResent = await sendVerificationEmail(email, verificationToken, 'sign-up');

    if (emailResent) {
      return res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
    } else {
      return res.status(500).json({ message: 'Error resending verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ message: 'Error resending verification email.' });
  }
};


module.exports = {
  signup,
  resendVerificationEmail,
  verifyAndMove,
  
};

