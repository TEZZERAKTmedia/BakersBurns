const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PendingUser = require('../../models/pendingUser');
const User = require('../../models/user');
const Message = require('../../models/messages');
const Thread = require('../../models/threads');
const sendVerificationEmail = require('../../utils/buildEmail'); // Nodemailer utility
const { v4: uuidv4 } = require('uuid');


// Signup Controller
const signup = async (req, res) => {
  const { userName, email, password, phoneNumber, isOptedInForPromotions, isOptedInForEmailUpdates, hasAcceptedPrivacyPolicy, hasAcceptedTermsOfService, } = req.body; // Include the new opt-in fields
  console.log("Received signup request body:", req.body);

  const RESTRICTED_USERNAMES = ['null', 'NULL', 'admin', 'administrator', 'root'];

if (!userName || RESTRICTED_USERNAMES.includes(userName.toLowerCase())) {
  return res.status(400).json({ message: 'Invalid username. Please choose another.' });
}
if (!hasAcceptedPrivacyPolicy || !hasAcceptedTermsOfService) {
  return res.status(400).json({ message: 'You must accept the Privacy Policy and Terms of Service.' });
}
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
      // Create new pending user entry
      await PendingUser.create({
        userName,
        email,
        password: hashedPassword,
        phoneNumber,
        verificationToken, // Store the JWT token
        role: 'user',  // Assign a default role to the user during sign-up
        isOptedInForPromotions: isOptedInForPromotions, // Default to false if not provided
        isOptedInForEmailUpdates: isOptedInForEmailUpdates,  // Default to false if not provided
        hasAcceptedPrivacyPolicy: hasAcceptedPrivacyPolicy === true, // Ensure it's a boolean
        hasAcceptedTermsOfService: hasAcceptedTermsOfService === true, // Ensure it's a boolean
        privacyPolicyAcceptedAt: hasAcceptedPrivacyPolicy ? new Date() : null, // Set timestamp only if accepted
        termsAcceptedAt: hasAcceptedTermsOfService ? new Date() : null, 
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

const checkUsername = async (req, res) => {
  const { userName } = req.body;

  const RESTRICTED_USERNAMES = ['null', 'NULL', 'admin', 'administrator', 'root'];

  if (!userName || RESTRICTED_USERNAMES.includes(userName.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid username. Please choose another.' });
  }

  try {
    const pendingUser = await PendingUser.findOne({ where: { userName } });
    if (pendingUser) {
      return res.status(400).json({ message: 'Username is already taken (Pending verification)' });
    }

    const existingUser = await User.findOne({ where: { userName } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken (Registered)' });
    }

    return res.status(200).json({ message: 'Username is available' });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ message: 'Server error checking username' });
  }
};




// Verify and Move Controller

const createAccount = async (req, res) => {
  const { email, token } = req.query;

  console.log("Starting account creation process for email:", email);

  try {
    // Step 1: Verify the token
    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully for:", decoded.email);

    if (decoded.email !== email) {
      console.warn("Token email mismatch:", decoded.email, "vs", email);
      return res.status(400).json({ message: 'Invalid token or email mismatch.' });
    }

    // Find the pending user by email
    const pendingUser = await PendingUser.findOne({ where: { email } });
    if (!pendingUser) {
      console.warn("Pending user not found for email:", email);
      return res.status(404).json({ message: 'Pending user not found.' });
    }
    console.log("Pending user found:", pendingUser.userName);

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.warn("User with email already exists:", email);
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
      isOptedInForPromotions: pendingUser.isOptedInForPromotions,
      isOptedInForEmailUpdates: pendingUser.isOptedInForEmailUpdates,
      hasAcceptedPrivacyPolicy: !!pendingUser.privacyPolicyAcceptedAt, // True if timestamp exists
      privacyPolicyAcceptedAt: pendingUser.privacyPolicyAcceptedAt || null, // Set the actual timestamp or null
      hasAcceptedTermsOfService: !!pendingUser.termsAcceptedAt, // True if timestamp exists
      termsAcceptedAt: pendingUser.termsAcceptedAt || null, // Set the actual timestamp or null
      isVerified: true, // This user is verified after the email verification process
      role: 'user', // Default role for the user
  });
  console.log("User moved to Users table with ID:", newUser.id);
  

    // Delete the pending user entry
    await PendingUser.destroy({ where: { email } });

    // Check if a thread already exists for this user
    let thread = await Thread.findOne({ 
      where: { senderEmail: email, receiverEmail: null } // Receiver email is NULL for shared threads
    });

    // If no thread exists, create a new one with adminId set to NULL
    if (!thread) {
      const threadId = uuidv4();
      thread = await Thread.create({
        threadId,
        senderEmail: email,
        receiverEmail: null, // NULL indicates the thread is accessible to all admins
        adminId: null, // NULL means it's a shared thread
      });
      console.log("New shared thread created with ID:", thread.threadId);
    } else {
      console.log("Existing thread found with ID:", thread.threadId);
    }

    // Create the initial message in the shared thread
    const initialMessage = await Message.create({
      threadId: thread.threadId,
      senderUsername: 'NULL', // Use a generic sender username
      receiverUsername: newUser.username,
      messageBody: 'Hi, welcome to BakersBurns. How can I help?',
      createdAt: new Date(),
    });
    console.log("Initial message created with ID:", initialMessage.id);

    return res.status(200).json({
      message: 'Account created successfully, and initial message created.',
      verified: true,
      redirectUrl: process.env.DEV_USER_URL || 'http://localhost:4001',
    });

  } catch (error) {
    console.error('Account creation error:', error);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};




const generateLoginTokenAndSetCookie = async (req, res) => {
  const { email } = req.body; // Pass the email to fetch user details

  try {
    // Fetch the user from the Users table using the email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new authentication token (JWT) for the verified user based on the user data
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role  // Role is explicitly taken from the Users table
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log token and role for debugging purposes
    console.log('Generated token:', token);
    console.log('User role:', user.role);

    // Set a secure cookie for protecting future routes
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent client-side access to cookie
      secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
      domain: process.env.COOKIE_DOMAIN || 'localhost', // Cross-subdomain, if needed
      maxAge: 60 * 60 * 1000, // 1-hour expiration
      sameSite: 'Lax', // Prevent CSRF attacks
    });

    // Respond with success and redirect URL
    return res.status(200).json({
      message: 'Login successful. Token and cookie generated.',
      redirectUrl: process.env.DEV_USER_URL || 'http://localhost:4001', // Redirect to user dashboard
    });
  } catch (error) {
    console.error('Login and cookie generation error:', error);
    return res.status(500).json({ message: 'Failed to log in and set cookie.' });
  }
};

module.exports = { generateLoginTokenAndSetCookie };

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
  checkUsername,
  createAccount,
  generateLoginTokenAndSetCookie
};

