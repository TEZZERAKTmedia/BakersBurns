const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

// Initialize Sequelize using environment variables
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, // Default to 3306 if not specified
        dialect: process.env.DB_DIALECT || 'mysql', // Default to 'mysql'
    }
);

// Define Media model
const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'Media',
    timestamps: false,
});

// Path to uploads directory (can also be set via environment variable)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

const cleanupMedia = async () => {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        const mediaRecords = await Media.findAll();
        const databaseFiles = mediaRecords.map((record) => record.url);

        if (!fs.existsSync(uploadsDir)) {
            console.error('Uploads directory does not exist:', uploadsDir);
            return;
        }

        const uploadFiles = fs.readdirSync(uploadsDir);
        const filesToDelete = uploadFiles.filter((file) => !databaseFiles.includes(file));

        filesToDelete.forEach((file) => {
            const filePath = path.join(uploadsDir, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        });

        console.log('Media cleanup completed successfully.');
    } catch (error) {
        console.error('Error during media cleanup:', error);
    } finally {
        await sequelize.close();
    }
};

// Schedule the cron job to run every 14 hours
cron.schedule('0 */24 * * *', async () => {
    console.log('Running media cleanup cron job...');
    await cleanupMedia();
});

console.log('Media cleanup cron job scheduled to run every 24 hours.');
