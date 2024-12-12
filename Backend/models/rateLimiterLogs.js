const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
class RateLimiterLogs extends Model {}

  RateLimiterLogs.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ip_address: {
        type: DataTypes.STRING(45), // To handle both IPv4 and IPv6
        allowNull: false,
      },
      route_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      request_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      blocked_until: {
        type: DataTypes.DATE, // Nullable; only set when blocking occurs
        allowNull: true,
      },
      last_request: {
        type: DataTypes.DATE, // Track the time of the most recent request
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'RateLimiterLogs',
      tableName: 'RateLimiterLogs', // Explicit table name
      underscored: true, // Use snake_case for DB columns
    }
  );




module.exports = RateLimiterLogs;
