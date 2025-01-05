const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');


class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Processing'
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    
  },

  shippingAddress: {
    type: DataTypes.TEXT, // Changed to TEXT to allow longer strings
    allowNull: true,
  },
  billingAddress: {
    type: DataTypes.TEXT, // Changed to TEXT to allow longer strings
    allowNull: true,
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'Orders' // Match the actual table name in the database
});

// Associations


module.exports = Order;
