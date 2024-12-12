
const Message = require('../../models/messages');
const User = require('../../models/user');
const Thread = require('../../models/threads');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const { Sequelize } = require('sequelize');

// Search for users by username or email
const searchInAppUsers = async (req, res) => {
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
const sendInAppMessage = async (req, res) => {
  const { threadId, messageBody, receiverUsername } = req.body;

  if (!messageBody || !threadId) {
    return res.status(400).json({ error: 'Message body and threadId are required' });
  }

  try {
    // Validate that the thread exists
    const thread = await Thread.findOne({
      where: { threadId },
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found or unauthorized' });
    }

    // Create the message with senderUsername explicitly set to null
    await Message.create({
      senderUsername: null, // Always set senderUsername to null
      receiverUsername, // Provided by the frontend
      messageBody,
      threadId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};






// Fetch all messages for a specific threadId
const fetchAllThreadIds = async (req, res) => {
  try {
    // Fetch threads with sender and receiver details
    const threads = await Thread.findAll({
      include: [
        {
          model: User,
          as: 'senderUser',
          attributes: ['username'], // Sender details
        },
        {
          model: User,
          as: 'receiverUser',
          attributes: ['username'], // Receiver details
        },
      ],
      attributes: ['threadId', 'senderEmail', 'receiverEmail'], // Thread attributes
    });

    // Fetch the latest message for each thread using a subquery for each threadId
    const latestMessages = await Promise.all(
      threads.map(async (thread) => {
        const message = await Message.findOne({
          where: { threadId: thread.threadId },
          attributes: ['threadId', 'messageBody', 'createdAt'],
          order: [['createdAt', 'DESC']], // Ensure the most recent message is fetched
        });

        return { threadId: thread.threadId, message };
      })
    );

    // Map threads to include the latest message
    const formattedThreads = threads.map((thread) => {
      const lastMessage = latestMessages.find((msg) => msg.threadId === thread.threadId)?.message;

      return {
        threadId: thread.threadId,
        senderUsername: thread.senderUser?.username || 'Unknown',
        receiverUsername: thread.receiverUser?.username || 'Unknown',
        lastMessage: lastMessage
          ? {
              messageBody: lastMessage.messageBody,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    res.status(200).json({ threads: formattedThreads });
  } catch (error) {
    console.error('Error fetching threads with last message:', error);
    res.status(500).json({ error: 'Failed to fetch threads with last message' });
  }
};







const fetchMessagesByThreadId = async (req, res) => {
  const { threadId } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: 'Thread ID is required' });
  }

  try {
    // Fetch messages associated with the threadId
    const messages = await Message.findAll({
      where: { threadId },
      attributes: ['id', 'threadId', 'messageBody', 'senderUsername', 'receiverUsername', 'createdAt'],
      include: [
        {
          model: User,
          as: 'sender', // Fetch sender details
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'ASC']] // Ensure chronological order
    });

    // Format response for frontend
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      threadId: message.threadId,
      messageBody: message.messageBody,
      senderUsername: message.senderUsername || 'Admin', // Default to "Admin" for abstraction
      receiverUsername: message.receiverUsername || null, // Explicitly show `null` for admins
      createdAt: message.createdAt
    }));

    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages by threadId:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};





const getRolesByThreadId = async (req, res) => {
  const { threadId } = req.params; // Corrected to use params instead of query

  if (!threadId) {
    return res.status(400).json({ message: 'Thread ID is required' });
  }

  try {
    // Fetch messages with associated user roles
    const messages = await Message.findAll({
      where: { threadId },
      include: [
        {
          model: User,
          as: 'sender', // Assuming Message model has a foreign key `senderId`
          attributes: ['username', 'role'], // Select `username` and `role` for each sender
        },
      ],
    });

    // Format response to include sender role and username
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      senderUsername: message.sender.username,
      senderRole: message.sender.role,
      messageBody: message.messageBody,
      createdAt: message.createdAt,
    }));

    return res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages with roles:', error);
    return res.status(500).json({ message: 'Error fetching messages' });
  }
};






const getUsernamesByThreadId = async (req, res) => {
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

const checkThread = async (req, res) => {
  const { receiverUsername } = req.query;
  const senderUsername = req.user.role === 'admin' ? null : req.user.username;

  try {
    const receiver = await User.findOne({ where: { username: receiverUsername } });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    let thread = await Message.findOne({
      where: {
        senderUsername: senderUsername, // Handle null for admin
        receiverUsername
      }
    });

    if (!thread) {
      thread = await Message.create({
        senderUsername,
        receiverUsername,
        threadId: await exports.generateNewThreadId()
      });
    }

    return res.json({ threadId: thread.threadId });
  } catch (error) {
    console.error('Error checking or creating thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteThreadId = async (req, res) => {
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

module.exports = { 
  getRolesByThreadId,
  deleteThreadId,
  checkThread,
  getUsernamesByThreadId,
  fetchAllThreadIds,
  sendInAppMessage,
  searchInAppUsers,
  fetchMessagesByThreadId,
 
}