const Message = require('../../models/messages');  // Assuming you have a Message model
const User = require('../../models/user');          // Assuming you have a User model
const { Op } = require('sequelize');
const crypto = require('crypto');

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_secret_key_32_chars'; // 32 characters for AES-256
const IV_LENGTH = 16; // AES block size

// Encrypt function
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

// Fetch all received messages for the logged-in user
exports.getReceivedMessages = async (req, res) => {
  const userId = req.user.id;  // Get the logged-in user's ID

  try {
    const messages = await Message.findAll({
      where: { receiverId: userId },
      order: [['createdAt', 'DESC']],
    });

    const decryptedMessages = messages.map(message => ({
      ...message.toJSON(),
      messageBody: decrypt(message.messageBody),
      senderUsername: message.senderUsername,
      senderRole: message.senderRole,
      receiverUsername: message.receiverUsername,
      receiverRole: message.receiverRole,
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Failed to fetch received messages' });
  }
};

// Fetch all sent messages for the logged-in user
exports.getSentMessages = async (req, res) => {
  const userId = req.user.id;

  try {
    const messages = await Message.findAll({
      where: { senderId: userId },
      order: [['createdAt', 'DESC']],
    });

    const decryptedMessages = messages.map(message => ({
      ...message.toJSON(),
      messageBody: decrypt(message.messageBody),
      senderUsername: message.senderUsername,
      senderRole: message.senderRole,
      receiverUsername: message.receiverUsername,
      receiverRole: message.receiverRole,
    }));

    res.json(decryptedMessages);
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
      { where: { receiverId: userId, read: false } }
    );
    res.json({ message: 'All unread messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Send a new message with spam prevention (users can only send 3 consecutive messages without admin response)
exports.sendMessageToAdmin = async (req, res) => {
  const userId = req.user.id;
  const { messageBody, recipientId } = req.body;
  const { username: senderUsername, role: senderRole } = req.user;

  try {
    const recentMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: recipientId },
          { senderId: recipientId, receiverId: userId },
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 3,  // Check the most recent 3 messages
    });

    const allMessagesByUser = recentMessages.every(message => message.senderId === userId);

    if (allMessagesByUser) {
      return res.status(403).json({ error: 'You cannot send more messages until the admin responds.' });
    }

    const encryptedMessageBody = encrypt(messageBody);

    const recipient = await User.findOne({ where: { id: recipientId } });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const newMessage = await Message.create({
      senderId: userId,
      senderUsername: senderUsername,
      senderRole: senderRole,
      receiverId: recipient.id,
      receiverUsername: recipient.username,
      receiverRole: recipient.role,
      messageBody: encryptedMessageBody,
      createdAt: new Date(),
      read: false,
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Send a message in response to a previous sender
exports.sendMessageToPreviousSender = async (req, res) => {
  const userId = req.user.id;
  const { messageBody } = req.body;
  const { username: senderUsername, role: senderRole } = req.user;

  try {
    const lastMessage = await Message.findOne({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ]
      },
      order: [['createdAt', 'DESC']],
    });

    if (!lastMessage) {
      return res.status(400).json({ error: 'No previous messages found to determine the recipient.' });
    }

    const receiverId = lastMessage.senderId !== userId ? lastMessage.senderId : lastMessage.receiverId;
    const receiverUsername = lastMessage.senderId !== userId ? lastMessage.senderUsername : lastMessage.receiverUsername;
    const receiverRole = lastMessage.senderId !== userId ? lastMessage.senderRole : lastMessage.receiverRole;

    const encryptedMessageBody = encrypt(messageBody);

    const newMessage = await Message.create({
      senderId: userId,
      senderUsername: senderUsername,
      senderRole: senderRole,
      receiverId: receiverId,
      receiverUsername: receiverUsername,
      receiverRole: receiverRole,
      messageBody: encryptedMessageBody,
      createdAt: new Date(),
      read: false,
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
