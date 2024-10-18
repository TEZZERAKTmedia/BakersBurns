
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
  const { messageBody, receiverUsername } = req.body;

  if (!messageBody || !receiverUsername) {
    return res.status(400).json({ error: 'Message body and receiverUsername cannot be empty' });
  }

  try {
    const senderUsername = req.user.username; // Extract sender username from authenticated user via middleware

    // Use getOrCreateThreadId to check if a thread exists or create a new one
    const threadId = await exports.getOrCreateThreadId(senderUsername, receiverUsername);

    // Create the new message
    await Message.create({
      senderUsername,  // Sender's username (admin)
      receiverUsername, // Receiver's username (from the frontend)
      messageBody,      // Message content
      threadId,         // Thread ID
      createdAt: new Date(),
      updatedAt: new Date()
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
    // Get the logged-in user's username from the cookie
    const loggedInUsername = req.user.username;

    // Fetch all unique thread IDs with senderUsername and receiverUsername
    const threads = await Message.findAll({
      attributes: [
        'threadId',
        'senderUsername',
        'receiverUsername',
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageTime'], // Time of last message
      ],
      group: ['threadId'], // Group by threadId only
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']], // Sort by last message time
    });

    // Filter and label each thread with the other user's username
    const filteredThreads = threads.map(thread => {
      // If the logged-in user is the sender, label the thread with the receiver's username
      const threadPreviewUsername = thread.senderUsername === loggedInUsername 
        ? thread.receiverUsername 
        : thread.senderUsername;
      
      return {
        threadId: thread.threadId,
        threadPreviewUsername, // Label the thread with the other user's username
        lastMessageTime: thread.lastMessageTime
      };
    });

    res.status(200).json({ threads: filteredThreads });
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



exports.getUsernamesByThreadId = async (req, res) => {
  const { threadId } = req.params;

  try {
    // Fetch the message with sender and receiver by threadId
    const message = await Message.findOne({
      where: { threadId },
      attributes: ['senderUsername', 'receiverUsername'],
    });

    if (!message) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const senderUsername = message.senderUsername;
    const receiverUsername = message.receiverUsername;

    res.status(200).json({
      senderUsername,
      receiverUsername,
    });
  } catch (error) {
    console.error('Error fetching usernames by threadId:', error);
    res.status(500).json({ error: 'Failed to fetch usernames' });
  }
};

exports.checkThread = async (req, res) => {
  const { receiverUsername } = req.query; // Get receiver's username from query parameters
  const senderUsername = req.user.username; // Assuming the middleware attaches user info (admin)

  try {
    // Check if the receiver exists
    const receiver = await User.findOne({ where: { username: receiverUsername } });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if a thread exists between the sender (admin) and receiver (user)
    let thread = await Message.findOne({
      where: {
        senderUsername,
        receiverUsername
      }
    });

    // If no thread exists, create a new one
    if (!thread) {
      thread = await Message.create({
        senderUsername,
        receiverUsername
      });
    }

    // Return thread ID
    return res.json({ threadId: thread.id });
  } catch (error) {
    console.error('Error checking or creating thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteThreadId = async (req, res) => {
  const { threadId } = req.params;

  if (!threadId) {
    return res.status(400).json({ error: 'ThreadId is required' });
  }

  try {
    // Delete all messages associated with the threadId
    await Message.destroy({
      where: { threadId }
    });

    res.status(200).json({ message: 'Thread and associated messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
};
