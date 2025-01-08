const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance
const Product = require('./product'); // Import the Product model

const GuestCart = sequelize.define('GuestCart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'GuestCarts', // Custom table name
});



module.exports = GuestCart;
