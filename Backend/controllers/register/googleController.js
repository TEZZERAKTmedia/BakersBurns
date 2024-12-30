const { OAuth2Client } = require("google-auth-library");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../../models/user"); // User model
const Thread = require("../../models/threads"); // Thread model
const Message = require("../../models/messages"); // Message model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function handleGoogleAuth(req, res) {
  try {
    const { idToken, hasAcceptedPrivacyPolicy, hasAcceptedTermsOfService } = req.body;

    // Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const googleId = payload.sub; // Google unique user ID
    const picture = payload.picture;

    // Check if the user exists in the database
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // New user flow
      if (!hasAcceptedPrivacyPolicy || !hasAcceptedTermsOfService) {
        return res.status(400).json({
          success: false,
          isNewUser: true,
          message: "You must accept the Privacy Policy and Terms of Service to create an account.",
        });
      }

      // Create a new user
      try {
        user = await User.create({
            email,
            username: email, // Use email as default username
            role: 'user',
            isVerified: true,
            googleId,
            profilePicture: picture || null,
            hasAcceptedPrivacyPolicy: true,
            privacyPolicyAcceptedAt: new Date(),
            hasAcceptedTermsOfService: true,
            termsAcceptedAt: new Date(),
        });
        console.log('User created successfully:', user);
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ success: false, message: 'Error creating user account.' });
    }
    

      console.log("New user created:", user.email);

      // Create a thread for user-admin communication
      const thread = await Thread.findOrCreate({
        where: { senderEmail: email, receiverEmail: null },
        defaults: {
          threadId: uuidv4(),
          senderEmail: email,
          receiverEmail: null,
          adminId: null,
        },
      });

      console.log(`Thread ensured for user: ${email}`);
    } else {
      // Existing user flow
      if (!user.hasAcceptedPrivacyPolicy || !user.hasAcceptedTermsOfService) {
        return res.status(403).json({
          success: false,
          isNewUser: false,
          message: "You must accept the Privacy Policy and Terms of Service to proceed.",
        });
      }
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set a secure cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "Lax",
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });

    console.log("Cookie set for user:", user.email);

    // Redirect to USER_FRONTEND
    res.status(200).json({
      success: true,
      message: "Authentication successful.",
      redirectUrl: process.env.USER_FRONTEND,
    });
  } catch (error) {
    console.error("Error during Google Authentication:", error);
    res.status(500).json({ success: false, message: "Authentication failed." });
  }
}

async function checkGoogleUserStatus(req, res) {
    try {
      const { idToken } = req.body;
  
      // Verify the Google ID Token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
  
      const email = payload.email;
  
      // Check if the user exists in the database
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        // New user: needs to accept terms and preferences
        return res.status(200).json({
          success: false,
          needsAcceptance: true,
          message: "New user detected. Privacy Policy and Terms of Service must be accepted.",
        });
      }
  
      // Existing user: skip terms acceptance
      return res.status(200).json({
        success: true,
        needsAcceptance: false,
        message: "User already exists and accepted terms.",
        redirectUrl: process.env.USER_FRONTEND,
      });
    } catch (error) {
      console.error("Error checking Google user status:", error);
      res.status(500).json({ success: false, message: "Error verifying user status." });
    }
  }
  
// we added the threadId and message generation to this funtion due to the nature of it only being triggered during sign up
  async function updateTermsAcceptance(req, res) {
    console.log("Received data:", req.body); // Debugging
  
    const { email, hasAcceptedTermsOfService, hasAcceptedPrivacyPolicy, isOptedInForPromotions, isOptedInForEmailUpdates } = req.body;
  
    if (!email || !hasAcceptedTermsOfService || !hasAcceptedPrivacyPolicy) {
      return res.status(400).json({
        success: false,
        message: "Invalid data. Ensure email and acceptance values are provided.",
      });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
  
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. This endpoint is for new users only.",
        });
      }
  
      // Create a new user with acceptance and preferences
      const newUser = await User.create({
        email,
        username: email, // Use email as default username
        role: 'user',
        isVerified: true,
        hasAcceptedPrivacyPolicy,
        privacyPolicyAcceptedAt: new Date(),
        hasAcceptedTermsOfService,
        termsAcceptedAt: new Date(),
        isOptedInForPromotions: isOptedInForPromotions || false,
        isOptedInForEmailUpdates: isOptedInForEmailUpdates || false,
      });
  
      console.log("New user created:", newUser.email);
  
      // Create a thread for user-admin communication
      let thread = await Thread.findOne({
        where: { senderEmail: email, receiverEmail: null },
      });
  
      if (!thread) {
        const threadId = uuidv4();
        thread = await Thread.create({
          threadId,
          senderEmail: email,
          receiverEmail: null, // NULL indicates the thread is shared among admins
          adminId: null,
        });
        console.log("New shared thread created with ID:", thread.threadId);
      } else {
        console.log("Existing thread found with ID:", thread.threadId);
      }
  
      // Create an initial message in the thread
      try {
        const initialMessage = await Message.create({
          threadId: thread.threadId,
          senderUsername: "NULL", // A meaningful identifier for system-generated messages
          receiverUsername: newUser.username,
          messageBody: "Hi, welcome to BakersBurns! How can we assist you?",
          createdAt: new Date(),
        });
        console.log("Initial message created with ID:", initialMessage.id);
      } catch (err) {
        console.error("Error creating initial message:", err);
        return res.status(500).json({ success: false, message: "Failed to create initial message." });
      }
  
      return res.status(200).json({
        success: true,
        message: "User registered successfully, thread and message created.",
      });
    } catch (error) {
      console.error("Error during user registration:", error);
      return res.status(500).json({ success: false, message: "Error registering user." });
    }
  }
  

module.exports = { handleGoogleAuth, checkGoogleUserStatus, updateTermsAcceptance };
