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
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
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

// Define Products model
const Products = sequelize.define('Products', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'Products',
    timestamps: false,
});

// Define Gallery model
const Gallery = sequelize.define('Gallery', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'Gallery',
    timestamps: false,
});

// Path to uploads directory
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

const cleanupMedia = async () => {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Step 1: Fetch all media, thumbnails, and gallery images
        const mediaRecords = await Media.findAll();
        const mediaFiles = mediaRecords.map((record) => record.url);

        const productRecords = await Products.findAll();
        const productThumbnails = productRecords.map((record) => record.thumbnail).filter(Boolean);

        const galleryRecords = await Gallery.findAll();
        const galleryImages = galleryRecords.map((record) => record.image);

        // Combine all files referenced in the database
        const databaseFiles = [...mediaFiles, ...productThumbnails, ...galleryImages];

        // Step 2: Get all files in the uploads folder
        if (!fs.existsSync(uploadsDir)) {
            console.error('Uploads directory does not exist:', uploadsDir);
            return;
        }

        const uploadFiles = fs.readdirSync(uploadsDir);

        // Step 3: Identify and delete files not in the database
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
