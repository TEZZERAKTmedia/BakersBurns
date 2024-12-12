const Message = require('../../models/messages');  // Assuming you have a Message model
const User = require('../../models/user');          // Assuming you have a User model
const { Op } = require('sequelize');

// Get or Create a Thread ID between sender and receiver
// Get or Create a Thread ID between sender and receiver
exports.getThreadId = async (req, res) => {
  const senderUsername = req.user.username;  // Middleware provides the username

  try {
    // Check if a thread exists where the current user is either the sender or receiver
    const existingThread = await Message.findOne({
      where: {
        [Op.or]: [
          { senderUsername: senderUsername },
          { receiverUsername: senderUsername }
        ]
      },
      attributes: ['threadId'],
      order: [['createdAt', 'ASC']]  // Order by when the thread was created
    });

    if (existingThread) {
      // Return the existing threadId
      return res.status(200).json({ threadId: existingThread.threadId });
    }

    // No existing thread found, return a suitable response
    return res.status(404).json({ message: 'No thread found for this user.' });
  } catch (error) {
    console.error('Error finding thread:', error);
    return res.status(500).json({ message: 'Server error while finding thread.' });
  }
};


exports.createThreadId = async (sender, receiver) => {
  try {
    // Generate a new threadId by incrementing the last threadId
    const newThreadId = await exports.generateNewThreadId();

    // Create a new message entry to initialize the thread with no messageBody
    const newThread = await Message.create({
      senderUsername: sender,
      receiverUsername: receiver,
      threadId: newThreadId,
      messageBody: '', // This can be empty initially, since this is the first thread creation step
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return newThread.threadId;
  } catch (error) {
    console.error('Error creating new thread:', error);
    throw error;
  }
};

// Helper function to generate a new threadId



exports.sendInAppMessage = async (req, res) => {
  const { messageBody, threadId } = req.body;
  const senderUsername = req.user.username;  // Get the logged-in user's username from the middleware

  if (!messageBody) {
    return res.status(400).json({ error: 'Message body cannot be empty' });
  }

  try {
    let receiverUsername;

    // If a threadId exists, fetch the sender and receiver usernames from the thread
    if (threadId) {
      const thread = await Message.findOne({
        where: { threadId },
        attributes: ['senderUsername', 'receiverUsername']
      });

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Determine the receiverUsername by checking who the logged-in user is
      receiverUsername = thread.senderUsername === senderUsername
        ? thread.receiverUsername
        : thread.senderUsername;

    } else {
      // If no threadId exists, create a new thread and set the receiver to the admin
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (!admin) {
        return res.status(500).json({ error: 'Admin not found' });
      }

      receiverUsername = admin.username;  // Set the admin as the receiver

      // Create the new thread
      const newThread = await Message.create({
        senderUsername,
        receiverUsername,
        messageBody: '', // Start the thread with no message body
        createdAt: new Date(),
        updatedAt: new Date()
      });

      threadId = newThread.threadId;  // Set the newly created threadId
    }

    // Create the actual message in the thread
    const message = await Message.create({
      senderUsername,
      receiverUsername,
      messageBody,
      threadId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({ message: 'Message sent successfully', threadId });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};





// Fetch messages by threadId and include sender roles
exports.fetchMessagesByThreadId = async (req, res) => {
  const { threadId } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: 'Thread ID is required' });
  }

  try {
    // Fetch all messages for the specified thread
    const messages = await Message.findAll({
      where: { threadId },
      attributes: ['id', 'messageBody', 'senderUsername', 'receiverUsername', 'createdAt'],
      order: [['createdAt', 'ASC']], // Sort by ascending creation date
    });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found' });
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages by threadId:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};


exports.getRolesByThreadId = async (req, res) => {
  const { threadId } = req.params;

  try {
    // Find a message in the thread to get the sender and receiver usernames
    const message = await Message.findOne({
      where: { threadId },
      attributes: ['senderUsername', 'receiverUsername'],
    });

    if (!message) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const senderUsername = message.senderUsername;
    const receiverUsername = message.receiverUsername;

    // Fetch the roles of the sender and receiver from the Users table
    const sender = await User.findOne({ where: { username: senderUsername } });
    const receiver = await User.findOne({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    // Return the roles of both the sender and receiver
    res.status(200).json({
      senderRole: sender.role,
      receiverRole: receiver.role,
    });
  } catch (error) {
    console.error('Error fetching roles by threadId:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

