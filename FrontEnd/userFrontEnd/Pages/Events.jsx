import React, { useState, useEffect } from 'react';
// Create a separate CSS file for styling the Events page
import { userApi } from '../config/axios';

const Events = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week'); // 'week' or 'month'
  const [showNavButtons, setShowNavButtons] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await userApi.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('There was an error fetching the events!', error);
    }
  };

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const getDaysInMonth = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const generateCalendarDays = () => {
    if (view === 'week') {
      const startOfWeek = getStartOfWeek(new Date(date));
      const days = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        days.push(currentDay);
      }

      return days;
    } else {
      return getDaysInMonth(new Date(date));
    }
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();

    return days.map((day) => {
      const options = { weekday: 'short', day: 'numeric' };
      const formattedDay = day.toLocaleDateString('default', options);
      const month = day.toLocaleDateString('default', { month: 'long' });

      return (
        <div
          key={day.toDateString()}
          className={`calendar-day ${isCurrentWeek(day) ? 'highlight' : ''}`}
        >
          <div className="date-background">
            <div className="date-label">
              {formattedDay}, {month}
            </div>
          </div>
          <div className="events-list">
            {events
              .filter(event => new Date(event.date).toDateString() === day.toDateString())
              .map(event => (
                <div key={event.id} className="event-item">
                  {event.name} - {event.description} ({event.start_time} - {event.end_time})
                </div>
              ))}
          </div>
        </div>
      );
    });
  };

  const isCurrentWeek = (date) => {
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return date >= startOfWeek && date <= endOfWeek;
  };

  const switchView = () => {
    setShowNavButtons(!showNavButtons);
    setView(view === 'week' ? 'month' : 'week');
  };

  const changeMonth = (increment) => {
    setDate(new Date(date.setMonth(date.getMonth() + increment)));
  };

  return (
    <div className="events-page">
      <h2 className="events-header-home">Upcoming Events</h2>
      <div className="calendar-header">
        {showNavButtons && <button onClick={() => changeMonth(-1)}>Previous</button>}
        <span onClick={switchView}>
          {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
        </span>
        {showNavButtons && <button onClick={() => changeMonth(1)}>Next</button>}
      </div>
      <div className="calendar-container">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Events;
