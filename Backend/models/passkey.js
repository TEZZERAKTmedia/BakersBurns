const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Import your configured Sequelize instance

const Passkey = sequelize.define('Passkey', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  // The table name of the Users model
      key: 'id',
    },
  },
  credentialId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Ensure each credential ID is unique
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  counter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,  // Automatically manage `createdAt` and `updatedAt`
  tableName: 'Passkeys',
});

module.exports = Passkey;
