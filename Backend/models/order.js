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
      if (typeof value === 'object') {
        console.log('Converting object to JSON string for encryption:', value);
        value = JSON.stringify(value); // Convert object to JSON string
      }
      console.log('Encrypting shippingAddress:', value);
      this.setDataValue('shippingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('shippingAddress');
      console.log('Getting shippingAddress (encrypted):', value);
      const decryptedValue = value ? decrypt(value) : null;
      try {
        return JSON.parse(decryptedValue); // Parse JSON string back to object
      } catch (e) {
        console.warn('Failed to parse decrypted shippingAddress:', decryptedValue);
        return decryptedValue; // Return raw string if parsing fails
      }
    }
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    set(value) {
      if (typeof value === 'object') {
        console.log('Converting object to JSON string for encryption:', value);
        value = JSON.stringify(value); // Convert object to JSON string
      }
      console.log('Encrypting billingAddress:', value);
      this.setDataValue('billingAddress', encrypt(value));
    },
    get() {
      const value = this.getDataValue('billingAddress');
      console.log('Getting billingAddress (encrypted):', value);
      const decryptedValue = value ? decrypt(value) : null;
      try {
        return JSON.parse(decryptedValue); // Parse JSON string back to object
      } catch (e) {
        console.warn('Failed to parse decrypted billingAddress:', decryptedValue);
        return decryptedValue; // Return raw string if parsing fails
      }
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
