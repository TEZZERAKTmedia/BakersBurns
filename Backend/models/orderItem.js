const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  orderId: {
      type: DataTypes.INTEGER,
      references: {
          model: 'Orders', // This should match your table name
          key: 'id'
      },
      allowNull: false
  },
  productId: {
      type: DataTypes.INTEGER,
      references: {
          model: 'Products', // This should match your table name
          key: 'id'
      },
      allowNull: false
  },
  quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
  },
  price: {
      type: DataTypes.FLOAT,
      allowNull: false
  }
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'OrderItems' // Match the actual table name in the database
});


module.exports = OrderItem;
