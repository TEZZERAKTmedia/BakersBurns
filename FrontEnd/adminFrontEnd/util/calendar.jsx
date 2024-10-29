import moment from 'moment';

/**
 * Generate recurring events between start and end date based on selected days.
 * @param {Array} daysOfWeek - Array of days (e.g., ['Monday', 'Wednesday']).
 * @param {String} startDate - The event's start date (e.g., '2024-10-01').
 * @param {String} endDate - The event's end date (e.g., '2024-10-31').
 * @param {Object} eventData - Event data like name, description, etc.
 * @returns {Array} Array of events for the recurring days.
 */
const generateRecurringEvents = (daysOfWeek, startDate, endDate, eventData) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const eventDays = [];

  // Map day names to moment.js day numbers
  const daysMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };

  while (start.isSameOrBefore(end)) {
    const dayOfWeek = start.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayName = Object.keys(daysMap).find(day => daysMap[day] === dayOfWeek);

    if (daysOfWeek.includes(dayName)) {
      eventDays.push({
        title: eventData.name,
        description: eventData.description,
        start: moment(start.format('YYYY-MM-DD') + ' ' + eventData.startTime).toDate(),
        end: moment(start.format('YYYY-MM-DD') + ' ' + eventData.endTime).toDate(),
      });
    }

    start.add(1, 'day'); // Move to the next day
  }

  return eventDays;
};
