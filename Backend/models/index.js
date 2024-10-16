const sequelize = require('../config/database'); 

// Import models directly
const User = require('./user');
const Product = require('./product');
const Order = require('./order');

const db = {
  User,
  Product,
  Order,
};

// Manually define associations
User.associate = (models) => {
  User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
};

Product.associate = (models) => {
  Product.hasMany(models.Order, { foreignKey: 'productId', as: 'orders' });
};

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
};

// Call the associate method to set up relationships
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;


module.exports = db;
