const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you need to check the user's role

const userAuthMiddleware = () => {
  return async (req, res, next) => {
    console.log('Cookies received'); // Debugging the received cookies

    const token = req.cookies && req.cookies.authToken; // Check if the token is present

    if (!token) {
      console.log('No token provided, access denied');
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debugging decoded token

      const user = await User.findByPk(decoded.id);
      if (!user) {
        console.log('User not found in the database');
        return res.status(404).json({ message: 'User not found' });
      }

      // Attach the user to the request object
      req.user = decoded;
      console.log('Middleware passed, user attached:'); // Debugging the user attached to req
      next();
    } catch (error) {
      console.log('Invalid token:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = userAuthMiddleware;
