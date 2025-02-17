const RateLimiterLogs = require('../models/rateLimiterLogs'); // Sequelize model
const moment = require('moment');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

/***************************************************
 * Nodemailer Setup (for rate limiter alerts)
 ***************************************************/
const ROOT_EMAIL = process.env.RootEmail; // Ensure this is in your .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

/**
 * Sends an email notification when the rate limiter is triggered.
 * @param {string} ip - The blocked IP address.
 * @param {string} routeName - The affected route.
 */
const sendRateLimiterAlert = async (ip, routeName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ROOT_EMAIL,
    subject: '🚨 Rate Limiter Triggered on Bakers Burns 🚨',
    text: `Hi,\n\nThe rate limiter on Bakers Burns was triggered.\n\n🔹 IP Address: ${ip}\n🔹 Route: ${routeName}\n\nThis might be a sign of a brute-force attempt or excessive API requests.\n\nBest regards,\nYour Server`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Rate limiter alert sent to ${ROOT_EMAIL}`);
  } catch (error) {
    console.error('❌ Error sending rate limiter alert:', error);
  }
};

/***************************************************
 * Exponential Backoff for Actual "Failed Attempts"
 *   e.g. for wrong credentials, invalid email, etc.
 ***************************************************/
/**
 * Handles failed login attempts with exponential backoff blocking.
 * Call this only when a real failure occurs (bad email, bad password, etc.).
 *
 * @param {string} ip - The client IP address.
 * @param {string} routeName - The route being accessed.
 * @param {number} maxAttempts - Maximum attempts before blocking.
 * @param {Array<number>} blockDurations - Array of block durations in minutes.
 */
const handleFailedLogin = async (
  ip,
  routeName,
  maxAttempts = 5,
  blockDurations = [3, 5, 10, 15, 30, 60, 1440]
) => {
  try {
    const now = moment();

    const log = await RateLimiterLogs.findOne({
      where: { ip_address: ip, route_name: routeName },
    });

    if (log) {
      log.request_count += 1;
      log.last_request = now.toDate();

      if (log.request_count > maxAttempts) {
        // Determine which block duration to apply
        const currentIndex = blockDurations.findIndex(
          (duration) => moment(log.blocked_until).isSameOrBefore(now)
        );
        const nextDuration =
          blockDurations[currentIndex + 1] || blockDurations[blockDurations.length - 1];

        log.blocked_until = now.add(nextDuration, 'minutes').toDate();
        log.request_count = 0; // Reset count after block

        console.log(`🚫 IP ${ip} blocked on ${routeName} for ${nextDuration} minutes.`);

        // 📧 Send an email alert
        await sendRateLimiterAlert(ip, routeName);
      }
      await log.save();
    } else {
      // Create a new log entry
      await RateLimiterLogs.create({
        ip_address: ip,
        route_name: routeName,
        request_count: 1,
        last_request: now.toDate(),
      });
    }
  } catch (err) {
    console.error('❌ Error handling failed login:', err);
  }
};

/**
 * Clears failed login attempts for an IP and route.
 * Typically used when the user eventually succeeds or an admin resets attempts.
 * @param {string} ip - The client IP address.
 * @param {string} routeName - The route being accessed.
 */
const clearFailedAttempts = async (ip, routeName) => {
  try {
    await RateLimiterLogs.destroy({
      where: { ip_address: ip, route_name: routeName },
    });
    console.log(`Cleared failed attempts for IP ${ip} on ${routeName}`);
  } catch (err) {
    console.error('Error clearing failed attempts:', err);
  }
};

/***************************************************
 * Generic Request Volume Rate Limiting
 *   For controlling total requests/route.
 ***************************************************/
/**
 * Base function that creates a rate limiter middleware.
 *
 * @param {string} routeName - Name of the route being accessed.
 * @param {number} maxRequests - Maximum requests allowed in the time window.
 * @param {number} blockDurationMinutes - Duration to block after exceeding maxRequests.
 * @returns Express middleware for rate limiting.
 */
function createRateLimiter(routeName, maxRequests, blockDurationMinutes) {
  return async (req, res, next) => {
    try {
      let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      if (ip.startsWith('::ffff:')) ip = ip.substring(7);

      const now = moment();

      // Check if currently blocked
      const blacklistedIp = await RateLimiterLogs.findOne({
        where: {
          ip_address: ip,
          route_name: routeName,
          blocked_until: { [Op.gt]: now.toDate() },
        },
      });

      if (blacklistedIp) {
        console.log(`Blocked IP: ${ip} on ${routeName}`);
        return res.status(429).json({
          error: `Access denied. This IP is temporarily blocked until ${moment(
            blacklistedIp.blocked_until
          ).format('YYYY-MM-DD HH:mm:ss')}.`,
        });
      }

      // Find or create a log entry for this IP/route to track request volume
      let log = await RateLimiterLogs.findOne({
        where: { ip_address: ip, route_name: routeName },
      });

      if (!log) {
        log = await RateLimiterLogs.create({
          ip_address: ip,
          route_name: routeName,
          request_count: 1,
          last_request: now.toDate(),
        });
      } else {
        // If enough time has passed since last request, reset
        const timeSinceLast = moment().diff(moment(log.last_request), 'minutes');
        if (timeSinceLast >= blockDurationMinutes) {
          log.request_count = 1;
        } else {
          log.request_count += 1;
        }
        log.last_request = now.toDate();

        // Check if we exceeded maxRequests within the current block window
        if (log.request_count > maxRequests) {
          // Block for blockDurationMinutes
          log.blocked_until = now.add(blockDurationMinutes, 'minutes').toDate();
          log.request_count = 0;
          console.log(`🚫 IP ${ip} blocked on ${routeName} for ${blockDurationMinutes} minutes.`);
          await sendRateLimiterAlert(ip, routeName);
        }

        await log.save();
      }

      next(); // Not blocked => proceed
    } catch (err) {
      console.error('Rate limiter error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/***************************************************
 *  Pre-Built Rate Limiters with Different Levels
 ***************************************************/
/**
 * Low Security => e.g. 1000 requests / 60 minutes
 */
const lowSecurityRateLimiter = (routeName) => createRateLimiter(routeName, 1000, 60);

/**
 * Medium Security => e.g. 100 requests / 60 minutes
 */
const mediumSecurityRateLimiter = (routeName) => createRateLimiter(routeName, 100, 60);

/**
 * High Security => e.g. 10 requests / 60 minutes
 */
const highSecurityRateLimiter = (routeName) => createRateLimiter(routeName, 10, 60);

/***************************************************
 * Exports
 ***************************************************/
module.exports = {
  // Exponential backoff for actual failures:
  handleFailedLogin,
  clearFailedAttempts,

  // Generic request volume limiting:
  createRateLimiter,
  lowSecurityRateLimiter,
  mediumSecurityRateLimiter,
  highSecurityRateLimiter,
};
