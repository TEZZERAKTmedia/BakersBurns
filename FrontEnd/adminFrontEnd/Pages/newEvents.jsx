
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../config/axios';
import moment from 'moment';
import '../Pagecss/events.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Events = () => {
  const [events, setEvents] = useState([]); // Unique events only
  const [calendarEvents, setCalendarEvents] = useState([]); //
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [editEventId, setEditEventId] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment());

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    frequency: 'weekly',
    startDate: '',
    endDate: '',
    startTime: '', 
    endTime: '',
    days: [],
  });
  const handleEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewEvent((prev) => ({
        ...prev,
        days: checked ? [...prev.days, value] : prev.days.filter((day) => day !== value),
      }));
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const resetForm = () => {
    setNewEvent({
      name: '',
      description: '',
      frequency: 'weekly',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [],
    });
  };

  const fetchEvents = async () => {
    try {
      const response = await adminApi.get('/event/events');
      const rawEvents = response.data;
  
      // Set unique events for the Event Preview section
      setEvents(rawEvents);
  
      // Generate all occurrences for calendar display
      const allOccurrences = rawEvents.flatMap(event => {
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
  

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    try {
      await adminApi.delete(`/event/events/${eventId}`);
      console.log(`Event with ID ${eventId} deleted successfully`);
      fetchEvents(); // Re-fetch events to update the calendar
    } catch (error) {
      console.error("Error deleting event:", error);
      setValidationError('Error deleting event');
    }
  };

  const handleAddEvent = async () => {
    if (!validateForm()) return;
    const formattedEvent = {
      ...newEvent,
      startDate: moment(newEvent.startDate).format('YYYY-MM-DD'),
      endDate: moment(newEvent.endDate).format('YYYY-MM-DD'),
      days: Array.isArray(newEvent.days) ? newEvent.days.join(',') : newEvent.days,
    };

    try {
      const response = await adminApi.post('/event/events', formattedEvent);
      setEvents([...events, response.data]);
      setShowAddEventForm(false);
      resetForm();
    } catch (error) {
      console.error("Error adding new event:", error);
      setValidationError('Error adding new event');
    }
  };

  const validateForm = () => {
    const { name, description, frequency, startDate, endDate, startTime, endTime, day } = newEvent
    if(!name || !description || !frequency || !startDate || !endDate || !startTime || !endTime || !day === 0) {
      setValidationError('All form inputs must be filled out');
    return false;
    }
    setValidationError('');
    return true;
    
  }
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
          date: start.format('YYYY-MM-DD'), // Ensure date format consistency for the calendar
        });
      }
      start.add(1, 'day'); // Move to the next day
    }
  
    return eventDays;
  };
  

  const handleDayChange = (day) => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      days: prevEvent.days.includes(day)
        ? prevEvent.days.filter((d) => d !== day)
        : [...prevEvent.days, day],

    }));
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, 'months'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, 'months'));
  };

  const renderCalendarDays = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');

    // Calculate start and end days for the calendar grid
    const startDay = startOfMonth.clone().startOf('week');
    const endDay = endOfMonth.clone().endOf('week');

    const days = [];
    let day = startDay.clone();

    while (day.isBefore(endDay, 'day')) {
      const isToday = day.isSame(moment(), 'day');
      const isCurrentMonth = day.isSame(currentDate, 'month');
      const eventsForDay = calendarEvents.filter(event => event.date === day.format('YYYY-MM-DD'));

      days.push(
        <div
          key={day.toString()}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${
            isToday ? 'today' : ''
          }`}
        >
          <span className="date-label">{day.date()}</span>
          {eventsForDay.map((event, index) => (
            <div key={index} className="event-item">
              <p className="event-title">{event.title}</p>
              <p className="event-time">{event.startTime} - {event.endTime}</p>
            </div>
          ))}
        </div>
      );
      day.add(1, 'day');
    }

    return days;
  };

  return (
    <div className='events-body'>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-center mb-8">Events Management</h1>
        {validationError && <p className="text-center text-red-500">{validationError}</p>}
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="flex justify-center mb-8">
          <motion.button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddEventForm(true)}
          >
            Add Event
          </motion.button>
        </div>

        {/* Custom Calendar */}
            <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
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
                {/* Event Preview Section */}
                <div className="event-preview-section bg-white p-6 shadow-md rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Event Previews</h2>
          {events.length === 0 && <p>No events to display</p>}
          {events.map((event) => (
            <div key={event.id} className="event-preview-tile p-4 mb-2 border rounded-lg flex flex-col">
              <div className="flex justify-between items-center">
                <div>
                  <p className="event-title font-semibold">{event.name}</p>
                  <p className="event-description text-gray-700">{event.description}</p>
                  <p className="event-date text-sm text-gray-600">
                    {moment(event.startDate).format('MMMM Do YYYY')} - {moment(event.endDate).format('MMMM Do YYYY')}
                  </p>
                  <p className="event-time text-sm text-gray-600">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-500" onClick={() => handleEditEvent(event)}>Edit</button>
                  <button className="text-red-500" onClick={() => handleDeleteEvent(event.id)}>🗑️</button>
                </div>
              </div>

              {editEventId === event.id && (
                <div className="edit-form mt-4">
                  <h3 className="text-lg font-semibold">Edit Event</h3>
                  {/* Include your edit form inputs here */}
                </div>
              )}
            </div>
          ))}
        </div>


{showAddEventForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-md">
              <button
                className="absolute top-2 right-2 text-gray-500"
                onClick={() => setShowAddEventForm(false)}
              >
                Close
              </button>
              <h2 className="text-2xl font-bold mb-4">Add New Event</h2>

              <div className="mb-4">
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Frequency</label>
                <select
                  value={newEvent.frequency}
                  onChange={(e) => setNewEvent({ ...newEvent, frequency: e.target.value })}
                  className="form-input"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Start Date</label>
                <DatePicker
                  selected={newEvent.startDate}
                  onChange={(date) => setNewEvent({ ...newEvent, startDate: date })}
                  className="form-input"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">End Date</label>
                <DatePicker
                  selected={newEvent.endDate}
                  onChange={(date) => setNewEvent({ ...newEvent, endDate: date })}
                  className="form-input"
                  dateFormat="yyyy-MM-dd"
                />
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

              <div className="mb-4">
                <label className="form-label">Select Days of the Week</label>
                <div className="grid grid-cols-7 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        value={day}
                        checked={newEvent.days.includes(day)}
                        onChange={() => handleDayChange(day)}
                        className="mr-2"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleAddEvent}>
                  Add Event
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Events;

