const multer = require('multer');
const path = require('path');

// MIME type validation function
const productFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG, MP4, MOV, and AVI files are allowed'), false);
  }
};

// Configure storage with absolute path
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const savePath = path.resolve(__dirname, '../uploads'); // Resolve absolute path
    cb(null, savePath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Middleware for handling product uploads
const productUploadMiddleware = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'media', maxCount: 10 },
]);

// Configure storage for social icons
const socialIconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const savePath = path.resolve(__dirname, '../socialIcons');
    cb(null, savePath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Middleware for handling social icon uploads

const socialIconUploadMiddleware = multer({
  storage: socialIconStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
}).single("image"); // ✅ Change `.fields([{ name: 'image', maxCount: 1 }])` to `.single("image")`


const galleryFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG, MP4, MOV, and AVI files are allowed'), false);
  }
};

// Configure storage with absolute path
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const savePath = path.resolve(__dirname, '../galleryuploads'); // Resolve absolute path
    cb(null, savePath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Middleware for handling product uploads
const galleryUploadMiddleware = multer({
  storage: galleryStorage,
  fileFilter: galleryFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
}).any();

// Configure storage for social icons

module.exports = {
  productUploadMiddleware,
  galleryUploadMiddleware,
  socialIconUploadMiddleware,
};
