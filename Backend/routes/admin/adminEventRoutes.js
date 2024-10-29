const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../../controllers/admin/adminEventController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware');

// Middleware to check if either admin or user is authenticated
const eitherAuthMiddleware = (req, res, next) => {
  adminAuthMiddleware()(req, res, (err) => {
    if (!err) {
      return next(); // Admin authenticated, proceed
    }

    userAuthMiddleware()(req, res, (err) => {
      if (!err) {
        return next(); // User authenticated, proceed
      }

      // If both fail, return unauthorized response
      return res.status(401).json({ message: 'Unauthorized: Admin or User authentication required' });
    });
  });
};

// Routes accessible by both admins and regular users
router.get('/events', eitherAuthMiddleware, getAllEvents);
router.get('/events/:id', eitherAuthMiddleware, getEventById);

// Routes restricted to admin-only access
router.post('/events', adminAuthMiddleware(), createEvent);
router.put('/events/:id', adminAuthMiddleware(), updateEvent);
router.delete('/events/:id', adminAuthMiddleware(), deleteEvent);

module.exports = router;
