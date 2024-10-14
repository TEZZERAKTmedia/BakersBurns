// models/Order.js
const xss = require('xss');
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
    type: DataTypes.DECIMAL(10, 2),  // Add this field to match your database schema
    allowNull: false,  // Ensure this is set to false if it's required
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }  // Assuming you have a User model
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' }  // Assuming you have a Product model
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Processing'  // You can change this based on your workflow
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  trackingNumber: {
    type: DataTypes.STRING,  // Adding tracking number field
    allowNull: true,         // It may be empty initially
  },
  carrier: {
    type: DataTypes.STRING,  // Adding carrier field
    allowNull: true,         // It may be empty initially
  },
}, {
  sequelize,
  modelName: 'Order',
  hooks: {
    beforeCreate: (order) => {
      // Sanitize fields before creation
      order.shippingAddress = xss(order.shippingAddress);
      order.billingAddress = xss(order.billingAddress);
      order.trackingNumber = xss(order.trackingNumber);
      order.carrier = xss(order.carrier);
    },
    beforeUpdate: (order) => {
      // Sanitize fields before updates
      order.shippingAddress = xss(order.shippingAddress);
      order.billingAddress = xss(order.billingAddress);
      order.trackingNumber = xss(order.trackingNumber);
      order.carrier = xss(order.carrier);
    }
  }
});

module.exports = Order;
