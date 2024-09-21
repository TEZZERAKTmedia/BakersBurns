const Message = require('../../models/messages');
const User = require('../../models/user'); // Assuming your user model is correctly named

// Send a message
exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, messageBody } = req.body;

    try {
        const receiver = await User.findByPk(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found'});
        }

        const message = await Message.create({
            senderId,
            receiverId,
            messageBody,
        })
        res.status(201).json({ message: 'Message sent successfully.',  data: message});
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error: error.message});
    }
}


// Get messages for a user
exports.getMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        receiverId: userId
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
};

// Update subscription preferences
exports.updatePreferences = async (req, res) => {
  const { userId } = req.params;
  const { isOptedInForMessaging, isOptedInForEmail, isOptedInForPushNotifications } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isOptedInForMessaging = isOptedInForMessaging;
    user.isOptedInForEmail = isOptedInForEmail;
    user.isOptedInForPushNotifications = isOptedInForPushNotifications;
    await user.save();

    res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
};
