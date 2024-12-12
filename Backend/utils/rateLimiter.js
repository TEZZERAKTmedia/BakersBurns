const RateLimiterLogs = require('../models/rateLimiterLogs'); // Import the model
const moment = require('moment');
const { Op } = require('sequelize');

/**
 * Handles failed login attempts with exponential backoff blocking.
 * @param {string} ip - The client IP address.
 * @param {string} routeName - The route being accessed.
 * @param {number} maxAttempts - Maximum attempts before blocking.
 * @param {Array<number>} blockDurations - Array of block durations in minutes.
 */
const handleFailedLogin = async (ip, routeName, maxAttempts = 5, blockDurations = [3, 5, 10, 15, 30, 60, 1440]) => {
  try {
    const now = moment();

    // Fetch existing log entry
    const log = await RateLimiterLogs.findOne({
      where: { ip_address: ip, route_name: routeName },
    });

    if (log) {
      log.request_count += 1;
      log.last_request = now.toDate();

      if (log.request_count > maxAttempts) {
        const currentIndex = blockDurations.findIndex((duration) => moment(log.blocked_until).isSameOrBefore(now));
        const nextDuration = blockDurations[currentIndex + 1] || blockDurations[blockDurations.length - 1];

        log.blocked_until = now.add(nextDuration, 'minutes').toDate();
        log.request_count = 0; // Reset count after block
        console.log(`IP ${ip} blocked on ${routeName} for ${nextDuration} minutes.`);
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
    console.error('Error handling failed login:', err);
  }
};

/**
 * Clears failed login attempts for an IP and route.
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

/**
 * Middleware for rate limiting requests and handling logs.
 * @param {string} routeName - Name of the route being accessed.
 * @param {number} maxRequests - Maximum requests allowed within the time window.
 * @param {number} blockDurationMinutes - Duration to block the IP after exceeding requests.
 * @param {boolean} isSensitive - If true, applies custom rules for sensitive routes.
 */
const rateLimiter = (routeName, maxRequests = 5, blockDurationMinutes = 3) => {
    return async (req, res, next) => {
        try {
            // Extract client IP
            let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
            if (ip.startsWith('::ffff:')) ip = ip.substring(7);

            const now = moment();

            // Check if IP is blacklisted
            const blacklistedIp = await RateLimiterLogs.findOne({
                where: { ip_address: ip, blocked_until: { [Op.gt]: now.toDate() } },
            });

            if (blacklistedIp) {
                console.log(`Blocked IP: ${ip} on ${routeName}`);
                return res.status(429).json({
                    error: `Access denied. This IP is temporarily blocked until ${moment(blacklistedIp.blocked_until).format('YYYY-MM-DD HH:mm:ss')}.`,
                });
            }

            next(); // Allow request to proceed
        } catch (err) {
            console.error('Rate limiter error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};


module.exports = { rateLimiter, handleFailedLogin, clearFailedAttempts };
