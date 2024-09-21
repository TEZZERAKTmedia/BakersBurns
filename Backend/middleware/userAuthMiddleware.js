const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you need to check the user's role

const userAuthMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    // Debugging: Log the cookies received in the request
    console.log('Cookies received:', req.cookies);

    // Check if the token is available in the cookie (userAuthToken)
    const token = req.cookies && req.cookies.authToken;  // Consistent token name

    if (!token) {
      console.log('No token provided in cookies, access denied');
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);  // Log decoded token for debugging

      // Check if the user's role matches
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
      }

      // Optionally, you can check if the user exists in the database
      const user = await User.findByPk(decoded.id);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      // Attach the decoded user information to the request for future routes
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Invalid token:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = userAuthMiddleware;
