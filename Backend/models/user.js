const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss');
const Message = require('./messages'); // Import Message model

// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure username is unique
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  verificationToken: {
    type: DataTypes.STRING
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isOptedInForPromotions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isOptedInForEmailUpdates: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasAcceptedPrivacyPolicy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default to false until explicitly accepted
  },
  privacyPolicyAcceptedAt: {
      type: DataTypes.DATE, // Stores the timestamp of when privacy policy was accepted
  },
  hasAcceptedTermsOfService: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default to false until explicitly accepted
  },
  termsAcceptedAt: {
      type: DataTypes.DATE, // Stores the timestamp of when terms were accepted
  },
}, {
  hooks: {
    beforeValidate: (user) => {
      user.username = xss(user.username);
      user.email = xss(user.email);
      user.password = xss(user.password);
      user.phoneNumber = user.phoneNumber ? xss(user.phoneNumber) : null;
      user.verificationToken = user.verificationToken ? xss(user.verificationToken) : null;
    }
  }
});

// Define associations
User.associate = (models) => {
  User.hasMany(models.Order, {
    foreignKey: 'userId',
    as: 'orders'
  });
  User.hasMany(models.Message, {
    foreignKey: 'senderUsername',
    sourceKey: 'username',
    as: 'sentMessages' // Alias for messages sent by the user
  });
};

module.exports = User;
