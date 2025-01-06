const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const xss = require('xss'); // Import the xss library for sanitization
const Product = require('./product'); // Import the Product model
const { v4: uuidv4 } = require('uuid');

const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Name of the Users table in the database
      key: 'id'
    }
  },
  guestId: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: uuidv4, // Automatically generate a UUID
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
  tableName: 'Cart', // Specify the exact table name to avoid pluralization
  hooks: {
    beforeValidate: (cart) => {
      console.log('Before sanitization:', cart.productId, cart.userId);
      cart.productId = xss(cart.productId.toString());
      cart.userId = xss(cart.userId.toString());
      console.log('After sanitization:', cart.productId, cart.userId);
    }
  }
});

// Define association with Product and enable cascade delete
Cart.belongsTo(Product, { 
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'CASCADE' // This enables cascade delete
});

module.exports = Cart;
