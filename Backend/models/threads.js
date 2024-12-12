// models/threads.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Message = require('./messages');

class Thread extends Model {}

Thread.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  threadId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
  },
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, { sequelize, modelName: 'Thread' });

// Define association with Messages using threadIdRa

module.exports = Thread;
