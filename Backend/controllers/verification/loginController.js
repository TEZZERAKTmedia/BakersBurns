const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, findUserByEmail } = require('../../models/loginUser');

// Allowed sameSite values from environment variables
const allowedSameSiteValues = ['Strict', 'Lax', 'None'];

const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  console.log('Login request received with identifier:', identifier);

  try {
    const isEmail = identifier.includes('@');
    const user = isEmail ? await findUserByEmail(identifier) : await findUserByUsername(identifier);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,  // JWT secret from .env
      { expiresIn: '1h' }
    );

    console.log('Generated token:', token);
    console.log('User role:', user.role);

    let redirectUrl;
    if (user.role === 'admin') {
      redirectUrl = process.env.DEV_ADMIN_URL; // Admin app URL from .env
    } else {
      redirectUrl = process.env.DEV_USER_URL; // User app URL from .env
    }

    console.log('Redirect URL:', redirectUrl);

    // Ensure that the sameSite value comes from the allowed set
    let sameSiteSetting = process.env.SAMESITE_COOKIE;
    if (!allowedSameSiteValues.includes(sameSiteSetting)) {
      console.warn(`Invalid sameSite value: ${sameSiteSetting}. Defaulting to 'Lax'.`);
      sameSiteSetting = 'Lax';  // Default to 'Lax' if not set or invalid for cross-domain
    }

    // Set a single cookie with cross-subdomain access
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: sameSiteSetting, // Use the SameSite value
      domain: process.env.NODE_ENV === 'production' ? 'bakersburns.com' : 'localhost', // Shared across subdomains in production
    });

    // Log the cookie information for debugging purposes
    console.log(`Cookie generated: authToken, domain: ${process.env.NODE_ENV === 'production' ? '.bakersburns.com' : 'localhost'}, sameSite: ${sameSiteSetting}, secure: ${process.env.NODE_ENV === 'production'}`);

    // Send the token and the redirect URL in the response body
    res.json({ token, redirectUrl });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser };

