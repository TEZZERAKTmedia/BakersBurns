const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminAuthMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Fetch user from database
      const user = await User.findByPk(decoded.id);

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
      }

      next();
    } catch (ex) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  };
};

module.exports = adminAuthMiddleware;
