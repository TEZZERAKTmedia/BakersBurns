const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    // Check if the token is available in the cookie
    const token = req.cookies && req.cookies.adminAuthToken;

    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the user's role matches
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
      }

      // Attach the decoded user information to the request
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = adminAuthMiddleware;
