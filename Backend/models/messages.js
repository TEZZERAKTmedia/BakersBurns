const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const sanitizeModelFields = require('../utils/sanitization'); // Utility to sanitize fields

const Message = sequelize.define('Messages', {
  senderUsername: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverUsername: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  messageBody: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'Messages',
  timestamps: false,
  hooks: {
    beforeSave: (message) => {
      sanitizeModelFields(message, ['senderUsername', 'receiverUsername', 'messageBody']);
    },
  },
});

module.exports = Message;
