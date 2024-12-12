const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); // Import the xss library

/**
 * Sanitizes specified fields of a Sequelize model instance using xss.
 * @param {Object} model - The Sequelize model instance.
 * @param {Array} fields - The fields to sanitize.
 */
const sanitizeModelFields = (model, fields) => {
  fields.forEach((field) => {
    if (model[field]) {
      model[field] = xss(model[field]); // Apply xss sanitization
    }
  });
};

const Message = sequelize.define(
  'Messages',
  {
    senderUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiverUsername: {
      type: DataTypes.STRING,
      allowNull: true,
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
  },
  {
    tableName: 'Messages',
    timestamps: false,
    hooks: {
      // Hook to sanitize fields before validation
      beforeValidate: (message) => {
        sanitizeModelFields(message, ['senderUsername', 'receiverUsername', 'messageBody']);
      },
      // Hook to sanitize fields before saving to the database
      beforeSave: (message) => {
        sanitizeModelFields(message, ['senderUsername', 'receiverUsername', 'messageBody']);
      },
    },
  }
);

module.exports = Message;
