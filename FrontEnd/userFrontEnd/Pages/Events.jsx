import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import '../Pagecss/events.css';

const UserEvents = () => {
  const [events, setEvents] = useState([]); // Original events fetched from the API
  const [calendarEvents, setCalendarEvents] = useState([]); // Recurring instances of events for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment());
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // State to track screen size

  // Detect screen size and set isSmallScreen
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    handleResize(); // Check screen size on component mount
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to generate recurring events
  const generateRecurringEvents = (daysOfWeek, startDate, endDate, eventData) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const eventDays = [];

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
      const dayOfWeek = start.day();
      const dayName = Object.keys(daysMap).find(day => daysMap[day] === dayOfWeek);

      if (daysOfWeek.includes(dayName)) {
        eventDays.push({
          id: eventData.id,
          title: eventData.name,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          date: start.format('YYYY-MM-DD'), // Ensure date format consistency
        });
      }
      start.add(1, 'day'); // Move to the next day
    }

    return eventDays;
  };

  const fetchEvents = async () => {
    try {
      const response = await userApi.get('/user-event/user-events'); // Adjust URL as needed
      console.log("Fetched events data:", response.data);
      setEvents(response.data);

      // Generate all occurrences for calendar display
      const allOccurrences = response.data.flatMap(event => {
        return generateRecurringEvents(
          event.days, 
          event.startDate, 
          event.endDate, 
          {
            id: event.id,
            name: event.name,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
          }
        );
      });

      setCalendarEvents(allOccurrences); // Set all instances for calendar view
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError('Error fetching events');
      setLoading(false);
    }
  };

  // Fetch the upcoming event
  const fetchUpcomingEvent = async () => {
    try {
      const response = await userApi.get('/user-event/upcoming'); // Adjust URL if necessary
      console.log("Fetched upcoming event:", response.data); // Log the returned data
      setUpcomingEvent(response.data);
    } catch (error) {
      console.error('Error fetching upcoming event:', error);
      setUpcomingEvent(null);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUpcomingEvent(); // Fetch upcoming event on mount
  }, []);

  const renderCalendarDays = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startDay = startOfMonth.clone().startOf('week');
    const endDay = endOfMonth.clone().endOf('week');
  
    const days = [];
    let day = startDay.clone();
  
    while (day.isBefore(endDay, 'day')) {
      const isToday = day.isSame(moment(), 'day');
      const isCurrentMonth = day.isSame(currentDate, 'month');
      const eventsForDay = calendarEvents.filter(
        (event) => event.date === day.format('YYYY-MM-DD')
      );
  
      // Determine the background color for the tile
      const backgroundColor = eventsForDay.length > 0 
        ? (isToday ? '#FFDD57' : '#AED581') // Highlight today or use a default event color
        : (isCurrentMonth ? '#FFFFFF' : '#F5F5F5'); // Default for current or other month days
  
      days.push(
        <div
          key={day.toString()}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month-day'} ${
            isToday ? 'today' : ''
          }`}
          style={{
            backgroundColor, // Set the dynamic background color
            borderRadius: '4px',
            padding: '5px',
            transition: 'background-color 0.3s ease', // Smooth color transition
          }}
        >
          <span className="date-label">{day.date()}</span>
          {!isSmallScreen &&
            eventsForDay.map((event, index) => (
              <div key={index} className="event-item">
                <p className="event-title">{event.title}</p>
                <p className="event-time">
                  {moment(event.startTime, 'HH:mm').format('hh:mm A')} -{' '}
                  {moment(event.endTime, 'HH:mm').format('hh:mm A')}
                </p>
                <p className="event-description">{event.description}</p>
              </div>
            ))}
        </div>
      );
      day.add(1, 'day');
    }
  
    return days;
  };
  

  return (
    <div style={{ marginTop: '100px' }} className='events-body'>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-center mb-8" style={{fontFamily: 'Dancing Script'}}>Events Calendar</h1>
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'months'))}>&lt;</button>
            <h2>{currentDate.format("MMMM YYYY")}</h2>
            <button onClick={() => setCurrentDate(currentDate.clone().add(1, 'months'))}>&gt;</button>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
        </div>

        {/* Upcoming Event Section */}
        {upcomingEvent && (
          <section className="upcoming-event-section" style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '2.5rem',
            borderRadius: '1.2rem',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <h2 style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '2.5rem',
              color: '#ffeb3b',
              textShadow: '2px 4px 10px rgba(0, 0, 0, 0.6)',
            }}>
              Upcoming Event
            </h2>
            <h3 style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '2rem',
              margin: '1rem 0',
            }}>
              {upcomingEvent.name}
            </h3>
            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '1.2rem',
              color: '#e0e0e0',
              margin: '0.8rem 0',
            }}>
              {moment(upcomingEvent.date).format('MMMM Do, YYYY')} 
              {upcomingEvent.startTime && ` at ${moment(upcomingEvent.startTime, 'HH:mm').format('h:mm A')}`}
            </p>
            <p style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              margin: '1rem auto',
            }}>
              {upcomingEvent.description}
            </p>
            <Link to="/event" className="upcoming-event-btn">See All Events</Link>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserEvents;
