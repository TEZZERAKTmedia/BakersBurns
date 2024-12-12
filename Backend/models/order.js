const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encrypt, decrypt } = require('../utils/encrypt');

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
    set(value) {
      this.setDataValue('shippingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('shippingAddress');
      return value ? decrypt(value) : null;
    }
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    set(value) {
      this.setDataValue('billingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('billingAddress');
      return value ? decrypt(value) : null;
    }
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carrier: {
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
