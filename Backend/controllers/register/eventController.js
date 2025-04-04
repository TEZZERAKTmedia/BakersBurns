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
                      // Events that are ongoing or will happen in the future
                      startDate: {
                          [Op.lte]: currentDate  // Start date is today or earlier
                      },
                      endDate: {
                          [Op.gte]: currentDate  // End date is today or later
                      },
                      // On the current date, check if the event is still active based on time
                      [Op.or]: [
                          {
                              startDate: currentDate,
                              startTime: {
                                  [Op.gte]: currentTime
                              }
                          },
                          {
                              startDate: { [Op.lt]: currentDate } // Events that started on previous days
                          }
                      ]
                  },
                  {
                      // Events that start in the future
                      startDate: {
                          [Op.gt]: currentDate
                      }
                  }
              ]
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