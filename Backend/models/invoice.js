const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Invoice extends Model {}

Invoice.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Optionally, reference the original Order ID
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Invoice type (e.g., 'order' for individual invoices, 'monthly', or 'yearly' for aggregated data)
  invoiceType: {
    type: DataTypes.ENUM('order', 'monthly', 'yearly'),
    allowNull: false,
    defaultValue: 'order',
  },
  // When the invoice was generated (defaults to the current timestamp)
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  // Summary order fields
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure username is unique
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  billingAddress: {
    type: DataTypes.TEXT,
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
  // A JSON field to store all order items as an array of objects
  orderItems: {
    type: DataTypes.JSON,
    allowNull: false,
    // Example format:
    // [
    //   { productId: 1, quantity: 2, price: 9.99 },
    //   { productId: 5, quantity: 1, price: 19.99 }
    // ]
  },
}, {
  sequelize,
  modelName: 'Invoice',
  tableName: 'Invoices'
});

module.exports = Invoice;
