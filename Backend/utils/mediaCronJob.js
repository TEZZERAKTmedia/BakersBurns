const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();



console.log("Media cleanup cron job script is running...");

// Initialize Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
    }
);

// Define models
const Media = sequelize.define('Media', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    url: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'Media', timestamps: false });

const Products = sequelize.define('Products', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'Products', timestamps: false });

const Gallery = sequelize.define('Gallery', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    image: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'Gallery', timestamps: false });

// Directory to clean up
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

/**
 * Fetch all referenced files in the database
 * @returns {Array<string>} List of file paths referenced in the database
 */
const fetchDatabaseFiles = async () => {
    const mediaRecords = await Media.findAll();
    const mediaFiles = mediaRecords.map((record) => record.url);

    const productRecords = await Products.findAll();
    const productThumbnails = productRecords.map((record) => record.thumbnail).filter(Boolean);

    const galleryRecords = await Gallery.findAll();
    const galleryImages = galleryRecords.map((record) => record.image);

    return [...mediaFiles, ...productThumbnails, ...galleryImages];
};

/**
 * Clean up unreferenced files in the uploads directory
 */
const cleanupMediaFiles = async () => {
    try {
        console.log('Starting media cleanup...');

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            console.error('Uploads directory does not exist:', uploadsDir);
            return;
        }

        // Fetch database files and files in the uploads directory
        const databaseFiles = await fetchDatabaseFiles();
        const uploadFiles = fs.readdirSync(uploadsDir);

        // Identify unreferenced files
        const filesToDelete = uploadFiles.filter((file) => !databaseFiles.includes(file));

        // Delete unreferenced files
        filesToDelete.forEach((file) => {
            const filePath = path.join(uploadsDir, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        });

        console.log('Media cleanup completed successfully.');
    } catch (error) {
        console.error('Error during media cleanup:', error);
    }
};

/**
 * Schedule the cron job to run every 24 hours
 */
const scheduleCleanupMediaCron = () => {
    cron.schedule('0 0 * * *', cleanupMediaFiles); // Runs at midnight UTC every day
    console.log('Media cleanup cron job scheduled to run every 24 hours.');

    // Test cleanup logic immediately on load
    (async () => {
        console.log('Running media cleanup immediately for testing...');
        await cleanupMediaFiles();
    })();
};

// Export the cron job scheduler
module.exports = scheduleCleanupMediaCron;
