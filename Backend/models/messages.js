const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as necessary

const Message = sequelize.define('Messages', {
  senderUsername: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiverUsername: {
    type: DataTypes.STRING,
    allowNull: false
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  messageBody: {
    type: DataTypes.TEXT, // Use DataTypes instead of Sequelize
    allowNull: false,
  },
}, {
  tableName: 'Messages',
  timestamps: false // If you don't want Sequelize to manage createdAt/updatedAt automatically
});

module.exports = Message;
