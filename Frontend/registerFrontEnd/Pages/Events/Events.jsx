import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { registerApi } from '../../config/axios';
import './Event.css';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsForDay, setEventsForDay] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await registerApi.get('/register-events/all');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    fetchEvents();
  }, []);

  const startOfMonth = currentMonth.clone().startOf('month');
  const endOfMonth = currentMonth.clone().endOf('month');
  const startDay = startOfMonth.day(); // Sunday=0
  const daysInMonth = currentMonth.daysInMonth();

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null); // Empty cells before the 1st
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const selected = currentMonth.clone().date(day).format('YYYY-MM-DD');
    setSelectedDate(selected);
    const filtered = events.filter(event => event.startDate === selected);
    setEventsForDay(filtered);
  };

  const hasEvent = (day) => {
    if (!day) return false;
    const dateStr = currentMonth.clone().date(day).format('YYYY-MM-DD');
    return events.some(event => event.startDate === dateStr);
  };

  const goToPrevMonth = () => setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(prev => prev.clone().add(1, 'month'));

  return (
    <div className='calendar-page'>
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPrevMonth}>←</button>
        <h2>{currentMonth.format('MMMM YYYY')}</h2>
        <button onClick={goToNextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-label">{day}</div>
        ))}

        {calendarDays.map((day, index) => {
        const dateStr = day
            ? currentMonth.clone().date(day).format('YYYY-MM-DD')
            : null;

        const isToday = dateStr === moment().format('YYYY-MM-DD');
        const cellClasses = [
            'calendar-cell',
            hasEvent(day) ? 'has-event' : '',
            isToday ? 'today' : ''
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div
            key={index}
            className={cellClasses}
            onClick={() => handleDayClick(day)}
            >
            {day || ''}
            </div>
        );
        })}

      </div>

      {selectedDate && (
        <div className="events-list">
          <h3>Events on {moment(selectedDate).format('MMMM Do')}</h3>
          {eventsForDay.length > 0 ? (
            eventsForDay.map(event => (
              <div key={event.id} className="event-details">
                <h4>{event.name}</h4>
                <p>{event.description}</p>
                {event.startTime && (
                  <p>Time: {moment(event.startTime, 'HH:mm:ss').format('h:mm A')}</p>
                )}
              </div>
            ))
          ) : (
            <p>No events on this day.</p>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default EventCalendar;
