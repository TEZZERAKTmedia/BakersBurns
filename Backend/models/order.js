const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this path as necessary

class Order extends Model {}

// Define the model
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
    references: { model: 'Users', key: 'id' },  // Ensure this is correct
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Processing'
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: true,  // You may set this to false if it's required
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,  // You may set this to false if it's required
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,  // It may be empty initially
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: true,  // It may be empty initially
  },
}, {
  sequelize,
  modelName: 'Order'
});

// Define associations
Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
};

module.exports = Order;
