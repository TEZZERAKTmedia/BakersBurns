const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); // Import xss library

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
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
  }
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

module.exports = User;
