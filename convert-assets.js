import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

// Directories to process
const assetDirs = [
  './Frontend/adminFrontEnd/assets',
  './Frontend/userFrontEnd/assets',
  './Frontend/registerFrontEnd/assets'
];

// Define the image formats to convert (excluding GIF)
const convertibleExtensions = ['.jpg', '.jpeg', '.png'];
const ignoredExtensions = ['.gif'];

const convertImageToWebP = async (inputPath) => {
  const ext = path.extname(inputPath).toLowerCase();
  // Skip GIF files
  if (ignoredExtensions.includes(ext)) {
    console.log(`🚫 Ignoring GIF file: ${inputPath}`);
    return;
  }
  
  // Use a case-insensitive regex to replace the extension at the end of the string
  const outputPath = inputPath.replace(new RegExp(ext + '$', 'i'), '.webp');
  try {
    await sharp(inputPath)
      .toFormat('webp', { quality: 80 }) // Adjust quality as needed
      .toFile(outputPath);
    await fs.remove(inputPath);
    console.log(`✅ Converted: ${inputPath} → ${outputPath}`);
  } catch (err) {
    console.error(`❌ Error converting ${inputPath}:`, err.message);
  }
};

const processDirectory = async (dir) => {
  try {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(itemPath);
      } else if (stats.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (convertibleExtensions.includes(ext)) {
          await convertImageToWebP(itemPath);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Error processing directory ${dir}:`, err.message);
  }
};

async function main() {
  for (const dir of assetDirs) {
    const fullPath = path.resolve(dir);
    if (await fs.pathExists(fullPath)) {
      console.log(`🔄 Processing directory: ${fullPath}`);
      await processDirectory(fullPath);
    } else {
      console.warn(`⚠️ Directory not found: ${fullPath}`);
    }
  }
  console.log('✅ All eligible images have been converted to WebP.');
}

main().catch((err) => {
  console.error('❌ Conversion script failed:', err);
});
