// convert-db-assets.js

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

// Import your Sequelize database connection and models.
// Adjust these paths as necessary.
const sequelize = require('./config/database');
const Gallery = require('./models/gallery');
const Product = require('./models/product');
const SocialLink = require('./models/socialLinks');

// Map folders to models and the field that stores the filename
const folders = [
  { folderPath: path.resolve(__dirname, './uploads'), model: Product, field: 'thumbnail' },
  { folderPath: path.resolve(__dirname, './galleryuploads'), model: Gallery, field: 'image' },
  { folderPath: path.resolve(__dirname, './socialIcons'), model: SocialLink, field: 'image' },
];

// File extensions to convert
const imageExtensions = ['.jpg', '.jpeg', '.png'];
const videoExtensions = ['.mp4', '.mov', '.avi'];

/**
 * Converts an image file to WebP.
 * @param {string} filePath - Full path to the image.
 * @returns {Promise<string|null>} - Returns the new file's basename or null on error.
 */
async function convertImageToWebP(filePath) {
  const ext = path.extname(filePath);
  const newFilePath = filePath.replace(ext, '.webp');
  try {
    await sharp(filePath)
      .webp({ quality: 80 }) // Adjust quality if needed
      .toFile(newFilePath);
      await fs.remove(inputPath);
      
    console.log(`✅ Converted ${path.basename(filePath)} to ${path.basename(newFilePath)}`);
    

    return path.basename(newFilePath);
  } catch (err) {
    console.error(`❌ Error converting ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

/**
 * Converts a video file to WebM.
 * @param {string} filePath - Full path to the video.
 * @returns {Promise<string|null>} - Returns the new file's basename or null on error.
 */
async function convertVideoToWebM(filePath) {
    const ext = path.extname(filePath);
    const newFilePath = filePath.replace(ext, '.webm');
    return new Promise((resolve) => {
      ffmpeg(filePath)
        .output(newFilePath)
        .videoCodec('libvpx')
        .audioCodec('libvorbis')
        .outputOptions('-b:v 1M') // Adjust bitrate if needed
        .on('end', () => {
          console.log(`✅ Converted ${path.basename(filePath)} to ${path.basename(newFilePath)}`);
          fs.remove(filePath)
            .then(() => {
              resolve(path.basename(newFilePath));
            })
            .catch((err) => {
              console.error(`❌ Error removing original file ${path.basename(filePath)}: ${err.message}`);
              resolve(path.basename(newFilePath));
            });
        })
        .on('error', (err) => {
          console.error(`❌ Error converting ${path.basename(filePath)}: ${err.message}`);
          resolve(null);
        })
        .run();
    });
  }
  

/**
 * Processes all files in a given folder, converts them as needed,
 * and updates the corresponding database record.
 * @param {Object} folderConfig - Contains folderPath, model, and field.
 */
async function processFolder(folderConfig) {
  const { folderPath, model, field } = folderConfig;
  if (!(await fs.pathExists(folderPath))) {
    console.warn(`⚠️ Folder not found: ${folderPath}`);
    return;
  }
  const files = await fs.readdir(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) continue;
    const ext = path.extname(file).toLowerCase();
    let newFilename = null;
    if (imageExtensions.includes(ext)) {
      newFilename = await convertImageToWebP(fullPath);
    } else if (videoExtensions.includes(ext)) {
      newFilename = await convertVideoToWebM(fullPath);
    }
    if (newFilename) {
      // Update database record: change the asset filename from the old to the new.
      try {
        const [affectedRows] = await model.update(
          { [field]: newFilename },
          { where: { [field]: file } }
        );
        console.log(`✅ Updated ${affectedRows} record(s) in ${model.name}: ${file} → ${newFilename}`);
      } catch (dbErr) {
        console.error(`❌ DB update error for ${file}: ${dbErr.message}`);
      }
      // Optionally, remove the original file if you don't need it:
      // await fs.remove(fullPath);
    }
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    for (const folderConfig of folders) {
      console.log(`🔄 Processing folder: ${folderConfig.folderPath}`);
      await processFolder(folderConfig);
    }
    console.log('✅ All eligible assets have been converted and database records updated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during conversion:', err);
    process.exit(1);
  }
}

main();
