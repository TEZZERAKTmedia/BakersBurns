const jwt = require('jsonwebtoken');


// Middleware to extract token from query parameters and set it in headers and verify JWT token
const userAuthMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const tokenFromQuery = req.query.token;
    if (tokenFromQuery) {
      req.headers['authorization'] = `Bearer ${tokenFromQuery}`;
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token.' });

      // Check if the user has the required role
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      req.user = user; // Attach user info to the request
      next();
    });
  };
};

module.exports = userAuthMiddleware;
