const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StripeEvent = sequelize.define('StripeEvent', {
  stripeEventId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Each Stripe event has a unique ID, so we enforce that.
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // Event type like 'payment_intent.succeeded', etc.
  },
  data: {
    type: DataTypes.JSON, // Store the full event payload in case it's needed later.
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processedAt: {
    type: DataTypes.DATE, // Null by default, filled in once the event is processed.
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed'), // Track the status of the event processing.
    defaultValue: 'pending',
  },
  errorMessage: {
    type: DataTypes.TEXT, // Any error that occurred during event processing.
    allowNull: true,
  },
});

module.exports = StripeEvent;
