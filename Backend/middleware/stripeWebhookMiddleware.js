const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware to handle raw body for Stripe Webhook validation
const stripeWebhookMiddleware = (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verifies the signature using Stripe's secret
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Attaches the event object to the request object for further handling
    req.stripeEvent = event;

    next(); // Continue to the handler function
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = stripeWebhookMiddleware;
