import React, { useState, useEffect } from 'react';
import '../Pagecss/Home.css'; // Import the CSS file for styling

const Home = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    frequency: '',
    days: [],
    startTime: '',
    endTime: ''
  });
  const [view, setView] = useState('week'); // 'week' or 'month'
  const [showNavButtons, setShowNavButtons] = useState(false);

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const fetchAdminEvents = async () => {
    // Example of fetching admin events (replace with your actual API call)
    const response = await fetch('/api/admin/events');
    const data = await response.json();
    setEvents(data);
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

  const handleEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setNewEvent((prev) => ({
          ...prev,
          days: [...prev.days, value]
        }));
      } else {
        setNewEvent((prev) => ({
          ...prev,
          days: prev.days.filter((day) => day !== value)
        }));
      }
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const addEvent = (e) => {
    e.preventDefault();
    const currentDate = new Date();
    const eventDates = [];

    if (newEvent.frequency === 'weekly') {
      for (let i = 0; i < 52; i++) {
        newEvent.days.forEach(day => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
          const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (i * 7) + (dayIndex - currentDate.getDay()));
          eventDates.push({ ...newEvent, date: eventDate });
        });
      }
    } else if (newEvent.frequency === 'bi-weekly') {
      for (let i = 0; i < 26; i++) {
        newEvent.days.forEach(day => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
          const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (i * 14) + (dayIndex - currentDate.getDay()));
          eventDates.push({ ...newEvent, date: eventDate });
        });
      }
    } else if (newEvent.frequency === 'monthly') {
      for (let i = 0; i < 12; i++) {
        newEvent.days.forEach(day => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
          const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, currentDate.getDate() + (dayIndex - currentDate.getDay()));
          eventDates.push({ ...newEvent, date: eventDate });
        });
      }
    } else if (newEvent.frequency === 'yearly') {
      for (let i = 0; i < 1; i++) {
        newEvent.days.forEach(day => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
          const eventDate = new Date(currentDate.getFullYear() + i, currentDate.getMonth(), currentDate.getDate() + (dayIndex - currentDate.getDay()));
          eventDates.push({ ...newEvent, date: eventDate });
        });
      }
    }

    setEvents([...events, ...eventDates]);
    setNewEvent({ name: '', description: '', frequency: '', days: [], startTime: '', endTime: '' });
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();
    return days.map((day) => {
      const options = { weekday: 'short', day: 'numeric' };
      const formattedDay = day.toLocaleDateString('default', options);
      const month = day.toLocaleDateString('default', { month: 'long' });
      return (
        <div key={day.toDateString()} className={`calendar-day ${isCurrentWeek(day) ? 'highlight' : ''}`}>
          <div className="date-label">
            {formattedDay}, {month}
          </div>
          <div className="events-list">
            {events
              .filter(event => new Date(event.date).toDateString() === day.toDateString())
              .map(event => (
                <div key={event.name} className="event-item">
                  {event.name} - {event.description} ({event.startTime} - {event.endTime})
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
    <div className="home-container">
      <div className="background-image"></div>
      <div className="content">
        <h1>Home</h1>
        <p>Welcome to the home page!</p>
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
        <div className="event-form">
          <h2>Add Event</h2>
          <form onSubmit={addEvent}>
            <input
              type="text"
              name="name"
              placeholder="Event Name"
              value={newEvent.name}
              onChange={handleEventChange}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Event Description"
              value={newEvent.description}
              onChange={handleEventChange}
              required
            />
            <select name="frequency" value={newEvent.frequency} onChange={handleEventChange} required>
              <option value="">Select Frequency</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="day-selector">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <label key={day} className="day-selector-label">
                  <input
                    type="checkbox"
                    name="days"
                    value={day}
                    checked={newEvent.days.includes(day)}
                    onChange={handleEventChange}
                  /> {day}
                </label>
              ))}
            </div>
            <label>
              Start Time:
              <input
                type="time"
                name="startTime"
                value={newEvent.startTime}
                onChange={handleEventChange}
                required
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                name="endTime"
                value={newEvent.endTime}
                onChange={handleEventChange}
                required
              />
            </label>
            <button type="submit">Add Event</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;

