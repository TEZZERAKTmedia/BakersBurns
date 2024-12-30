const { OAuth2Client } = require("google-auth-library");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../../models/user"); // User model
const Thread = require("../../models/threads"); // Thread model
const Message = require("../../models/messages"); // Message model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const allowedSameSiteValues = ['Strict', 'Lax', 'None'];

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
    let sameSiteSetting = process.env.SAMESITE_COOKIE;
    if (!allowedSameSiteValues.includes(sameSiteSetting)) {
      console.warn(`Invalid sameSite value: ${sameSiteSetting}. Defaulting to 'Lax'.`);
      sameSiteSetting = 'Lax';  // Default to 'Lax' if not set or invalid for cross-domain
    }


    // Set a secure cookie
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: sameSiteSetting, // Use the SameSite value
      domain: process.env.NODE_ENV === 'production' ? 'bakersburns.com' : 'localhost', // Shared across subdomains in production
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
// Define sendResponse first
const sendResponse = (res, success, message, redirectUrl = null) => {
  const responseData = { success, message };
  if (redirectUrl) responseData.redirectUrl = redirectUrl;

  console.log('Sending response:', responseData);
  return res.status(success ? 200 : 400).json(responseData);
};

// Now use it in updateTermsAcceptance
async function updateTermsAcceptance(req, res) {
  try {
    // Your existing logic here...

    return sendResponse(res, true, "Preferences updated successfully.", redirectUrl);
  } catch (error) {
    console.error("Error during user registration:", error);
    return sendResponse(res, false, "Error registering user.");
  }
}


async function updateTermsAcceptance(req, res) {
  try {
    const {
      email,
      hasAcceptedTermsOfService,
      hasAcceptedPrivacyPolicy,
      isOptedInForPromotions,
      isOptedInForEmailUpdates,
    } = req.body;

    // Log the incoming request body
    console.log("Received request to update terms acceptance with data:", req.body);

    // Check for missing or invalid data
    if (!email || !hasAcceptedTermsOfService || !hasAcceptedPrivacyPolicy) {
      console.error("Validation failed: Missing required fields.");
      return sendResponse(res, false, "Invalid data. Ensure email and acceptance values are provided.");
    }

    console.log("Validation passed. Checking if the user already exists...");

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.warn(`User with email ${email} already exists.`);
      return sendResponse(res, false, "User already exists. This endpoint is for new users only.");
    }

    console.log(`User with email ${email} does not exist. Proceeding to create a new user.`);

    // Create a new user with acceptance and preferences
    const newUser = await User.create({
      email,
      username: email, // Use email as default username
      role: "user",
      isVerified: true,
      hasAcceptedPrivacyPolicy,
      privacyPolicyAcceptedAt: new Date(),
      hasAcceptedTermsOfService,
      termsAcceptedAt: new Date(),
      isOptedInForPromotions: isOptedInForPromotions || false,
      isOptedInForEmailUpdates: isOptedInForEmailUpdates || false,
    });

    console.log("New user created successfully:", {
      email: newUser.email,
      id: newUser.id,
    });

    // Check or create a communication thread
    let thread = await Thread.findOne({
      where: { senderEmail: email, receiverEmail: null },
    });

    if (!thread) {
      console.log(`No thread found for email ${email}. Creating a new thread...`);
      const threadId = uuidv4();
      thread = await Thread.create({
        threadId,
        senderEmail: email,
        receiverEmail: null, // NULL indicates the thread is shared among admins
        adminId: null,
      });
      console.log("New shared thread created successfully:", {
        threadId: thread.threadId,
        senderEmail: email,
      });
    } else {
      console.log("Existing thread found:", {
        threadId: thread.threadId,
        senderEmail: email,
      });
    }

    // Create an initial message in the thread
    console.log(`Creating an initial message in thread ID ${thread.threadId}...`);
    await Message.create({
      threadId: thread.threadId,
      senderUsername: "NULL", // A meaningful identifier for system-generated messages
      receiverUsername: newUser.username,
      messageBody: "Hi, welcome to BakersBurns! How can we assist you?",
      createdAt: new Date(),
    });
    console.log("Initial message created successfully in thread ID:", thread.threadId);

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    let sameSiteSetting = process.env.SAMESITE_COOKIE;
    if (!allowedSameSiteValues.includes(sameSiteSetting)) {
      console.warn(`Invalid sameSite value: ${sameSiteSetting}. Defaulting to 'Lax'.`);
      sameSiteSetting = 'Lax';  // Default to 'Lax' if not set or invalid for cross-domain
    }


    // Set the authentication cookie
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: sameSiteSetting, // Use the SameSite value
      domain: process.env.NODE_ENV === 'production' ? 'bakersburns.com' : 'localhost', // Shared across subdomains in production
    });

    console.log("Cookie set for user:", newUser.email);

    // Send a success response with redirect URL
    const redirectUrl = process.env.USER_FRONTEND || "http://localhost:4001";
    return sendResponse(res, true, "Preferences updated successfully.", redirectUrl);
  } catch (error) {
    console.error("Error during user registration:", error);
    return sendResponse(res, false, "Error registering user.");
  }
}


  


module.exports = { handleGoogleAuth, checkGoogleUserStatus, updateTermsAcceptance };
