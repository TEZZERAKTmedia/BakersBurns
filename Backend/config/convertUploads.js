const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');

/**
 * Converts a file (image or video) to the appropriate web format.
 * For images, converts JPG/JPEG/PNG to WebP.
 * For videos, converts MP4/MOV/AVI to WebM.
 * Updates the file's name and path.
 */
async function convertFile(file) {
  const ext = path.extname(file.filename).toLowerCase();
  let newExt;
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    newExt = '.webp';
  } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
    newExt = '.webm';
  } else {
    // Skip unsupported types (or GIF, if you want to leave them as is)
    return;
  }

  const newFilename = file.filename.replace(ext, newExt);
  const newFilePath = path.join(path.dirname(file.path), newFilename);

  try {
    if (newExt === '.webp') {
      // Convert image to WebP
      await sharp(file.path)
        .webp({ quality: 80 }) // Adjust quality as needed
        .toFile(newFilePath);
    } else if (newExt === '.webm') {
      // Convert video to WebM
      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .output(newFilePath)
          .videoCodec('libvpx')
          .audioCodec('libvorbis')
          .outputOptions('-b:v 1M') // Adjust bitrate if needed
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    }
    // Optionally remove the original file:
    // await fs.remove(file.path);

    // Update the file object in req.files / req.file
    file.filename = newFilename;
    file.path = newFilePath;
    console.log(`✅ Converted ${file.originalname} → ${newFilename}`);
  } catch (err) {
    console.error(`❌ Error converting ${file.originalname}: ${err.message}`);
  }
}

/**
 * Middleware to process uploaded files.
 * It supports both req.files (from .fields or .array) and req.file (from .single)
 */
async function convertUploadedFiles(req, res, next) {
  const processFileArray = async (filesArray) => {
    for (const file of filesArray) {
      await convertFile(file);
    }
  };

  try {
    if (req.files) {
      // req.files can be an object with keys (for .fields) or an array (for .array)
      if (Array.isArray(req.files)) {
        await processFileArray(req.files);
      } else {
        for (const key in req.files) {
          if (Array.isArray(req.files[key])) {
            await processFileArray(req.files[key]);
          }
        }
      }
    }
    if (req.file) {
      await convertFile(req.file);
    }
    next();
  } catch (error) {
    console.error('❌ Conversion middleware error:', error);
    next(error);
  }
}

module.exports = {
  convertUploadedFiles,
};
