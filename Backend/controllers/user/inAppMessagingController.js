const Message = require('../../models/messages'); // Assuming you have a Message model
const User = require('../../models/user'); // Assuming you have a User model
const { Op } = require('sequelize'); 

const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_secret_key_32_chars'; // 32 characters for AES-256
const IV_LENGTH = 16; // AES block size
// Fetch all messages for the logged-in user
exports.getReceivedMessages = async (req, res) => {
  const userId = req.user.id;  // Get the logged-in user's ID

  try {
    // Fetch all messages where the user is the receiver
    const messages = await Message.findAll({
      where: { receiverId: userId },  // Only messages received by the user
      order: [['createdAt', 'DESC']],  // Sort by most recent first
    });

    res.json(messages);  // Send the messages to the frontend
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Failed to fetch received messages' });
  }
};

exports.getSentMessages = async (req, res) => {
  const userId = req.user.id;  // Get the logged-in user's ID

  try {
    // Fetch all messages where the user is the sender
    const messages = await Message.findAll({
      where: { senderId: userId },  // Only messages sent by the user
      order: [['createdAt', 'DESC']],  // Sort by most recent first
    });

    res.json(messages);  // Send the messages to the frontend
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ error: 'Failed to fetch sent messages' });
  }
};



// Mark all unread messages as read for the logged-in user
exports.markAllMessagesAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await Message.update(
      { read: true },
      { where: { receiverId: userId, read: false } } // Only mark unread messages as read
    );
    res.json({ message: 'All unread messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Send a new message from the user to the admin, with a limit of 3 messages before admin responds



exports.sendMessageToPreviousSender = async (req, res) => {
  const userId = req.user.id;  // ID of the user sending the message
  const { messageBody } = req.body;

  try {
    // Fetch the last message between the user and the previous sender
    const lastMessage = await Message.findOne({
      where: {
        [Op.or]: [
          { senderId: userId },   // Messages sent by the user
          { receiverId: userId }, // Messages received by the user
        ]
      },
      order: [['createdAt', 'DESC']],  // Get the most recent message
    });

    if (!lastMessage) {
      return res.status(400).json({ error: 'No previous messages found to determine the recipient.' });
    }

    // Set the receiverId to the sender of the last message
    const receiverId = lastMessage.senderId !== userId ? lastMessage.senderId : lastMessage.receiverId;

    // Create the new message
    const newMessage = await Message.create({
      senderId: userId,        // The current user is the sender
      receiverId,              // The previous message sender becomes the receiver
      messageBody,             // The message content
      createdAt: new Date(),
      read: false,             // Mark as unread by default
    });

    res.json(newMessage);  // Send the created message back to the frontend
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
//Encryption
function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex'); // Return iv with encrypted text
}

// Decrypt function
function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


