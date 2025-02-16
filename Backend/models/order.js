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
  shippingAddress: { // ✅ Removed duplicate definition
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
  shippingService: { // ✅ New field for shipping method
    type: DataTypes.STRING,
    allowNull: true,
  },
  shippingCost: { // ✅ New field for shipping cost
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'Orders'
});

module.exports = Order;
