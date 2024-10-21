// models/tempCart.js

const { DataTypes } = require('sequelize');
const db = require('../config/database'); // Adjust based on your database setup

const TempCart = db.define('TempCart', {
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = TempCart;
