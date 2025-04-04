const express = require('express');
const router = express.Router();
const { getAllUserEvents, getUpcomingEvent, getAllEvents } = require('../../controllers/register/eventController');



router.get('/get-events',  getAllUserEvents);
router.get('/upcoming', getUpcomingEvent);
router.get('/all', getAllEvents);

module.exports = router;