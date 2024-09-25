const Message = require('../../models/messages');  // Assuming you have a Message model
const User = require('../../models/user');

// Send message to selected users
exports.sendMessageInApp = async (req, res) => {
  const { messageBody, recipientIds } = req.body;

  if (!messageBody || recipientIds.length === 0) {
    return res.status(400).json({ error: 'Message body or recipients cannot be empty' });
  }

  try {
    for (const recipientId of recipientIds) {
      await Message.create({
        senderId: req.user.id,  // Assuming the sender's user ID is available via req.user
        receiverId: recipientId,
        messageBody,
        createdAt: new Date(),
      });
    }
    res.status(200).json({ message: 'Messages sent successfully' });
  } catch (error) {
    console.error('Error sending messages:', error);
    res.status(500).json({ error: 'Failed to send messages' });
  }
};

// Get all messages for a specific user
exports.getMessagesInApp = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.findAll({ where: { receiverId: userId } });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

// Update messaging preferences for a user
exports.updatePreferencesInApp = async (req, res) => {
  const { userId } = req.params;
  const { isOptedInForMessaging } = req.body;

  try {
    await User.update({ isOptedInForMessaging }, { where: { id: userId } });
    res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
