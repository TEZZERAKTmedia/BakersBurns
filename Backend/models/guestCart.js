const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');

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
  // Add missing product details
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.ENUM('metric', 'standard'),
    allowNull: false,
    defaultValue: 'standard',
  },
  // Shipping details columns:
  selectedCarrier: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  selectedService: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shippingCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'GuestCarts',
});

module.exports = GuestCart;
