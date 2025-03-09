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
 * Converts an image file to WebP and removes the original file on success.
 * @param {string} filePath - Full path to the image.
 * @returns {Promise<string|null>} - Returns the new file's basename or null on error.
 */
async function convertImageToWebP(filePath) {
  const ext = path.extname(filePath);
  const newFilePath = filePath.replace(ext, '.webp');
  try {
    // Convert to WebP using sharp
    await sharp(filePath)
      .webp({ quality: 80 }) // Adjust quality if needed
      .toFile(newFilePath);

    // Remove original file
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }

    console.log(`✅ Converted ${path.basename(filePath)} to ${path.basename(newFilePath)}`);
    return path.basename(newFilePath);
  } catch (err) {
    console.error(`❌ Error converting ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

/**
 * Converts a video file to WebM and removes the original file on success.
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
      // Adjust bitrate if needed (e.g., .outputOptions('-b:v 1M'))
      .on('end', async () => {
        console.log(`✅ Converted ${path.basename(filePath)} to ${path.basename(newFilePath)}`);
        // Remove original file
        try {
          if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
          }
          resolve(path.basename(newFilePath));
        } catch (removeErr) {
          console.error(`❌ Error removing original file ${path.basename(filePath)}: ${removeErr.message}`);
          resolve(path.basename(newFilePath));
        }
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

  // Skip if the folder doesn’t exist
  if (!(await fs.pathExists(folderPath))) {
    console.warn(`⚠️ Folder not found: ${folderPath}`);
    return;
  }

  const files = await fs.readdir(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const stats = await fs.stat(fullPath);

    // Skip subfolders or anything that isn’t a file
    if (!stats.isFile()) continue;

    const ext = path.extname(file).toLowerCase();

    // Make sure we only convert the file if it’s not already webp/webm
    if (ext === '.webp' || ext === '.webm') {
      continue; // Already converted or not supported for re-conversion
    }

    let newFilename = null;
    if (imageExtensions.includes(ext)) {
      newFilename = await convertImageToWebP(fullPath);
    } else if (videoExtensions.includes(ext)) {
      newFilename = await convertVideoToWebM(fullPath);
    }

    if (newFilename) {
      try {
        // Fetch existing record
        const record = await model.findOne({ where: { [field]: { [sequelize.Op.like]: `%${file}%` } } });
    
        if (record) {
          let updatedImages;
          
          // Check if the field is a JSON stringified array
          if (Array.isArray(record[field])) {
            // Replace old filename with new filename in the array
            updatedImages = record[field].map(img => img === file ? newFilename : img);
          } else if (typeof record[field] === 'string' && record[field].startsWith('["')) {
            // Parse JSON array if stored as string
            const imageArray = JSON.parse(record[field]);
            updatedImages = imageArray.map(img => img === file ? newFilename : img);
          } else {
            updatedImages = newFilename; // If it's just a string, replace it directly
          }
    
          // Update the database with the modified array
          await model.update(
            { [field]: JSON.stringify(updatedImages) },  // Convert back to JSON
            { where: { id: record.id } }
          );
    
          console.log(`✅ Updated ${model.name}: ${file} → ${newFilename}`);
        } else {
          console.warn(`⚠️ No matching record found for ${file} in ${model.name}`);
        }
      } catch (dbErr) {
        console.error(`❌ DB update error for ${file}: ${dbErr.message}`);
      }
    }
    
  }
}

/**
 * Main entrypoint: Connect to DB, process each folder, then exit.
 */
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
