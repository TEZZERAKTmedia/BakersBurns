const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');  // Assuming you have a User model
const Order = require('./order');  // Assuming you have an Order model
const xss = require('xss');  // For sanitizing the messageBody

const Message = sequelize.define('Message', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE',
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
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  messageBody: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message body cannot be empty',
      },
    },
    set(value) {
      this.setDataValue('messageBody', xss(value));  // Sanitize the input before saving
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = Message;
