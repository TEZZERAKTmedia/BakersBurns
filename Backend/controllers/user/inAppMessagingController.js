const Message = require('../../models/messages');  // Assuming you have a Message model
const User = require('../../models/user');          // Assuming you have a User model
const { Op } = require('sequelize');

// Get or Create a Thread ID between sender and receiver
// Get or Create a Thread ID between sender and receiver
exports.getThreadId = async (senderUsername, receiverUsername) => {
  try {
    // Check if a thread already exists between these two users, irrespective of who is sender/receiver
    const existingThread = await Message.findOne({
      where: {
        [Op.or]: [
          {
            senderUsername: senderUsername,
            receiverUsername: receiverUsername
          },
          {
            senderUsername: receiverUsername,
            receiverUsername: senderUsername
          }
        ]
      },
      attributes: ['threadId'],
      order: [['createdAt', 'ASC']]
    });

    // If a thread exists, return the threadId
    if (existingThread) {
      return existingThread.threadId;
    }

    // If no thread exists, return null (so that a new thread can be created)
    return null;
  } catch (error) {
    console.error('Error finding thread:', error);
    throw error;
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
exports.generateNewThreadId = async () => {
  const lastMessage = await Message.findOne({
    order: [['threadId', 'DESC']] // Fetch the most recent threadId
  });
  return lastMessage ? lastMessage.threadId + 1 : 1; // Start at 1 if no threads exist
};


// Example function to generate a new threadId (simple increment)
exports.generateNewThreadId = async () => {
  // Fetch the last threadId and increment
  const lastMessage = await Message.findOne({
    order: [['threadId', 'DESC']] // Get the latest threadId
  });

  // Start with 1 if no threads exist, otherwise increment the latest threadId by 1
  return lastMessage ? lastMessage.threadId + 1 : 1;
};


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

  try {
    // Fetch all messages for the thread
    const messages = await Message.findAll({
      where: { threadId },
      attributes: ['messageBody', 'senderUsername', 'receiverUsername', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Fetch roles for each sender using their username
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findOne({ where: { username: message.senderUsername }, attributes: ['role'] });
        return {
          ...message.get(),  // Extract the Sequelize data object
          senderRole: sender ? sender.role : 'unknown'  // Add the role to the message data
        };
      })
    );

    res.status(200).json({ messages: enrichedMessages });
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

