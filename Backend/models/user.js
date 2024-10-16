const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); 


// Define the User model
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

// Set up the association directly within the model
User.associate = (models) => {
  User.hasMany(models.Order, {
    foreignKey: 'userId',
    as: 'orders'
  });
};

module.exports = User;
