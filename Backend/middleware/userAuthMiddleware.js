const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you need to check the user's role

const userAuthMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      // Check if the token is available in the cookie
      const token = req.cookies.userAuthToken;

      if (!token) {
        console.log('No token provided, access denied');
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
      }

      console.log('Token extracted from cookie:', token);

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);  // Log decoded token for debugging

      // Optionally, check the user's role (if specific roles are required)
      const user = await User.findByPk(decoded.id);
      if (!user || (roles.length && !roles.includes(user.role))) {
        console.log('User does not have sufficient permissions');
        return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
      }

      // Attach the user info to the request object for later use in routes
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Invalid token:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = userAuthMiddleware;
