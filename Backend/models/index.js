const sequelize = require('../config/database');

// Import models directly
const User = require('./user');
const Product = require('./product');
const Order = require('./order');
const Message = require('./messages'); // Import Message model

const db = {
  User,
  Product,
  Order,
  Message, // Add Message model to db
};

// Manually define associations within each model
User.associate = (models) => {
  User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  User.hasMany(models.Message, { foreignKey: 'senderUsername', sourceKey: 'username', as: 'sentMessages' });
};

Product.associate = (models) => {
  Product.hasMany(models.Order, { foreignKey: 'productId', as: 'orders' });
};

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
};

// Define Message association
Message.associate = (models) => {
  Message.belongsTo(models.User, { foreignKey: 'senderUsername', targetKey: 'username', as: 'sender' });
};

// Call the associate method to set up relationships for each model
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;

module.exports = db;
