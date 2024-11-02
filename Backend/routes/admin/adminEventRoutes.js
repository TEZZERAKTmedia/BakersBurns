const express = require('express');

const router = express.Router();
const galleryController = require('../../controllers/admin/adminEventController');
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware');





// Routes accessible by both admins and regular users
router.get('/events',  adminAuthMiddleware(), galleryController.getAllEvents);
router.get('/events/:id',  adminAuthMiddleware(), galleryController.getEventById);

// Routes restricted to admin-only access
router.post('/events', adminAuthMiddleware(), galleryController.createEvent);
router.put('/events/:id', adminAuthMiddleware(), galleryController.updateEvent);
router.delete('/events/:id', adminAuthMiddleware(), galleryController.deleteEvent);

module.exports = router;
