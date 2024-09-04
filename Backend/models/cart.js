// models/cart.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product'); // Import the Product model

const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Name of the Users table in the database
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products', // Name of the Products table in the database
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Cart' // Specify the exact table name to avoid pluralization
});

// Define associations
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = Cart;
