const Event = require('../../models/events');


const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events'});
        
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found '});
        }
        res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event'});
    }
};

const createEvent = async (req, res) => {
    try {
      const { name, description, frequency, days, startDate, endDate, startTime, endTime } = req.body;
  
      console.log("Received Data:", req.body); // Log the received data
  
      const newEvent = await Event.create({
        name,
        description,
        frequency,
        days,
        startDate: new Date(startDate), // Ensure this is parsed correctly
        endDate: new Date(endDate), // Ensure this is parsed correctly
        startTime,
        endTime
      });
  
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event", error });
    }
  };
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { name, description,frequency, days,  startTime, endTime }= req.body;

    try {
        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found'});
        }

        event.name = name || event.name;
        event.description = description || event.description;
        event.frequency = frequency || event.frequency;
        event.days = days || event.days;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;

        await event.save();
        res.status(200).json({ message: 'Event successfully updated!', event});
        
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findByPk(id);
        if (!event) {  // Corrected this line
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.destroy();
        res.status(200).json({ message: 'Event deleted successfully' }); // Added response after deletion
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
};


module.exports = { 
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
}
