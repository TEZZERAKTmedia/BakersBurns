const { Order } = require('./models'); // Sequelize model for orders
const { fetchUPSTracking, fetchFedExTracking, fetchUSPSTracking } = require('./controllers/carriersController');

// Constants
const DAILY_QUOTA = 100000; // Total daily requests allowed
const RATE_LIMIT = 1400; // Max requests per 10 seconds
const INTERVAL_MS = 10000; // Process every 10 seconds

let totalRequestsToday = 0; // Counter to track daily requests

/**
 * Function to process a batch of orders
 * @param {Array} orders - Array of order objects
 */
const processBatch = async (orders) => {
    const trackingPromises = orders.map(async (order) => {
        const { id, trackingNumber, carrier } = order;

        try {
            let trackingData;

            // Call the appropriate carrier API
            switch (carrier.toLowerCase()) {
                case 'ups':
                    trackingData = await fetchUPSTracking(trackingNumber);
                    break;
                case 'fedex':
                    trackingData = await fetchFedExTracking(trackingNumber);
                    break;
                case 'usps':
                    trackingData = await fetchUSPSTracking(trackingNumber);
                    break;
                default:
                    throw new Error(`Unsupported carrier: ${carrier}`);
            }

            // Update the order status in the database
            if (trackingData) {
                await Order.update(
                    {
                        status: trackingData.status,
                        lastUpdated: trackingData.timestamp,
                    },
                    { where: { id } }
                );
            }
        } catch (error) {
            console.error(`Error processing order ${id}: ${error.message}`);
        }
    });

    await Promise.all(trackingPromises);
    console.log(`Processed ${orders.length} orders in this batch.`);
};

/**
 * Scheduler function to check active orders
 */
const startScheduler = async () => {
    try {
        while (totalRequestsToday < DAILY_QUOTA) {
            // Fetch all active orders
            const activeOrders = await Order.findAll({ where: { status: 'Processing' } });

            if (!activeOrders.length) {
                console.log('No active orders to process.');
                break;
            }

            // Calculate number of orders to process per minute
            const ordersPerMinute = Math.min(DAILY_QUOTA - totalRequestsToday, 8400); // Max requests per minute
            const batchSize = Math.min(ordersPerMinute / 6, RATE_LIMIT); // Requests per 10 seconds

            console.log(`Processing ${batchSize} orders per batch.`);

            // Divide orders into batches
            const batches = [];
            for (let i = 0; i < activeOrders.length; i += batchSize) {
                batches.push(activeOrders.slice(i, i + batchSize));
            }

            // Schedule each batch with 10-second intervals
            let batchIndex = 0;
            const interval = setInterval(async () => {
                if (batchIndex >= batches.length || totalRequestsToday >= DAILY_QUOTA) {
                    clearInterval(interval); // Stop the interval once all batches are processed
                    console.log('Scheduler completed for today.');
                    return;
                }

                // Process the current batch
                const currentBatch = batches[batchIndex];
                await processBatch(currentBatch);

                // Update counters
                totalRequestsToday += currentBatch.length;
                batchIndex++;
            }, INTERVAL_MS);
        }
    } catch (error) {
        console.error('Error in scheduler:', error.message);
    }
};

module.exports = { startScheduler };
