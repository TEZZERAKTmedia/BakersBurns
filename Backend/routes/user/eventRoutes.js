const express = require('express');
const router = express.Router();
const { getAllUserEvents, getUpcomingEvent } = require('../../controllers/user/userEventsController');
const userAuthMiddleware = require('../../middleware/userAuthMiddleware')


router.get('/user-events', userAuthMiddleware(), getAllUserEvents);
router.get('/upcoming', userAuthMiddleware(), getUpcomingEvent);

module.exports = router;