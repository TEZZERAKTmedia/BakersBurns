const Event = require('../../models/events');
const moment = require('moment');
const { Op } = require('sequelize');
const getAllUserEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);

    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Error fetching events'});
    }
}

const getUpcomingEvent = async (req, res) => {
    try {
      // Fetch the current date and time
      const currentDate = moment().format('YYYY-MM-DD');
      const currentTime = moment().format('HH:mm:ss');
  
      // Query for the next upcoming event
      const upcomingEvent = await Event.findOne({
        where: {
          [Op.or]: [
            {
              startDate: {
                [Op.gt]: currentDate, // Events with a startDate after today
              },
            },
            {
              startDate: {
                [Op.eq]: currentDate, // Events with today's date
              },
              startTime: {
                [Op.gte]: currentTime, // Only future events today based on time
              },
            },
          ],
        },
        order: [
          ['startDate', 'ASC'],  // Sort by start date ascending
          ['startTime', 'ASC'],   // Sort by start time ascending
        ],
      });
  
      // Check if an event was found
      if (!upcomingEvent) {
        return res.status(404).json({ message: 'No upcoming events found' });
      }
  
      // Return the upcoming event data
      res.status(200).json(upcomingEvent);
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      res.status(500).json({ message: 'Error fetching upcoming event' });
    }
  };

module.exports = {
     getAllUserEvents,
     getUpcomingEvent
}