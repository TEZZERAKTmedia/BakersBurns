const cron = require('node-cron');
const { sendEmailNotification } = require('./email');
const db = require('./db'); // Database connection

// Check and send notifications every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running notification cron job...');
  
  try {
    // Fetch all admins with notification settings
    const admins = await db.query(`
      SELECT n.*, a.email 
      FROM notification_settings n
      JOIN admins a ON n.admin_id = a.id
      WHERE n.notify_for_status = true
    `);

    for (const admin of admins.rows) {
      const { email, frequency_hours } = admin;

      // Find all orders with 'processing' status that have been stuck for more than the notification frequency
      const stuckOrders = await db.query(`
        SELECT * FROM orders
        WHERE status = 'processing'
        AND updated_at <= NOW() - INTERVAL '${frequency_hours} HOURS'
      `);

      if (stuckOrders.rows.length > 0) {
        // Send notification email to admin
        await sendEmailNotification(
          email,
          'Pending Shipments Alert',
          `
            <p>You have ${stuckOrders.rows.length} orders still marked as "processing".</p>
            <p>Please review them and take necessary action.</p>
          `
        );
        console.log(`Notification email sent to ${email}`);
      }
    }
  } catch (error) {
    console.error('Error in notification cron job:', error.message);
  }
});
