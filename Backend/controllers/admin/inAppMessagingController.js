const { v4: uuidv4 } = require('uuid');
const Message = require('../../models/messages');
const User = require('../../models/user');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

// Check if a thread exists or create a new one
 // Adjust path as necessary

// Function to get or create a thread between two users
exports.getOrCreateThreadId = async (sender, receiver) => {
  try {
    // Check if a thread already exists between the sender and receiver
    const existingThread = await Message.findOne({
      where: {
        senderUsername: sender,
        receiverUsername: receiver
      },
      order: [['createdAt', 'ASC']] // Sort by earliest message to get the thread's first message
    });

    // If an existing thread is found, return its threadId
    if (existingThread) {
      return existingThread.threadId;
    }

    // If no existing thread, create a new threadId (this can be a new sequence or UUID)
    const newThreadId = await this.generateNewThreadId(); // Use `this` or `exports`
 // Your custom logic to generate a new threadId
    return newThreadId;

  } catch (error) {
    console.error('Error finding or creating thread:', error);
    throw error;
  }
};

// Example function to generate a new threadId (simple increment)
exports.generateNewThreadId = async () => {
  // Fetch the last threadId and increment
  const lastMessage = await Message.findOne({
    order: [['threadId', 'DESC']] // Get the latest threadId
  });

  return lastMessage ? lastMessage.threadId + 1 : 1; // Start with 1 if no threads exist
};



// Search for users by username or email
exports.searchInAppUsers = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm || searchTerm.trim() === "") {
    return res.status(400).json({ error: 'Search term cannot be empty' });
  }

  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), 'LIKE', `%${searchTerm.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${searchTerm.toLowerCase()}%`)
        ]
      },
      attributes: ['id', 'username', 'email']
    });

    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get all messages related to the logged-in user (from the decoded token via middleware)
exports.sendInAppMessage = async (req, res) => {
  const { messageBody, recipientId, recipientUsername } = req.body;

  if (!messageBody || !recipientId || !recipientUsername) {
    return res.status(400).json({ error: 'Message body, recipientId, and recipientUsername cannot be empty' });
  }

  try {
    // Find the recipient by recipientId
    const recipient = await User.findOne({ where: { id: recipientId } });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Use getOrCreateThreadId to check if a thread exists or create a new one
    const threadId = await exports.getOrCreateThreadId(req.user.username, recipientUsername);

    // Create the new message
    await Message.create({
      senderUsername: req.user.username,  // Sender's username
      receiverUsername: recipientUsername, // Receiver's username
      messageBody,                         // Message content
      threadId,                            // Thread ID returned from getOrCreateThreadId
      createdAt: new Date(),               // Timestamp of when the message is created
      updatedAt: new Date()                // Timestamp of last update
    });

    res.status(200).json({ message: 'Message sent successfully', threadId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


// Fetch all messages for a specific threadId
exports.fetchAllThreadIds = async (req, res) => {
  try {
    // Fetch all unique thread IDs with receiverUsername
    const threads = await Message.findAll({
      attributes: [
        'threadId',
        'receiverUsername',
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageTime'], // Time of last message
      ],
      group: ['threadId', 'receiverUsername'], // Group by threadId and receiverUsername
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']], // Sort by last message time
    });

    res.status(200).json({ threads });
  } catch (error) {
    console.error('Error fetching thread IDs:', error);
    res.status(500).json({ error: 'Failed to fetch thread IDs' });
  }
};
exports.fetchMessagesByThreadId = async (req, res) => {
  const { threadId } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: 'threadId is required' });
  }

  try {
    const messages = await Message.findAll({
      where: { threadId }, // Fetch messages for the specific threadId
      attributes: ['messageBody', 'senderUsername', 'receiverUsername', 'createdAt'],
      order: [['createdAt', 'ASC']], // Order by oldest to newest
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages by threadId:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};




