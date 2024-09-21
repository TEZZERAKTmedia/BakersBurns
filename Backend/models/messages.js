const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user'); // Assuming you have a user model
const Order = require('./order'); // Assuming you have an order model

const Message = sequelize.define('Message', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE', // When the sender is deleted, cascade the delete
    onUpdate: 'CASCADE',
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Can be null for broadcast messages
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'SET NULL', // If the receiver is deleted, set to NULL
    onUpdate: 'CASCADE',
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Can be null for messages unrelated to orders
    references: {
      model: Order,
      key: 'id'
    },
    onDelete: 'SET NULL',  // If the order is deleted, set to NULL
    onUpdate: 'CASCADE',
  },
  messageBody: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = Message;
