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
      console.log('Setting shippingAddress:', value);
      this.setDataValue('shippingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('shippingAddress');
      console.log('Getting shippingAddress (encrypted):', value);
      const decryptedValue = value ? decrypt(value) : null;
      console.log('Decrypted shippingAddress:', decryptedValue);
      return decryptedValue;
    }
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    set(value) {
      console.log('Setting billingAddress:', value);
      this.setDataValue('billingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('billingAddress');
      console.log('Getting billingAddress (encrypted):', value);
      const decryptedValue = value ? decrypt(value) : null;
      console.log('Decrypted billingAddress:', decryptedValue);
      return decryptedValue;
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
