require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); // Assuming JWT is used for auth

// Import middleware


// Import routes
const cartRoutes = require('./routes/cartRoutes');
const emailVerificationRoutes = require('./routes/verificationRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const accountSettingsRoutes = require('./routes/accountSettingsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const verifiedRoutes = require('./routes/verifiedRoutes');
const signupRoutes = require('./routes/signupRoutes');

// Initialize Express app
const app = express();

app.use(cors({
  origin: ['http://localhost:5010', 'http://localhost:4001', 'http://localhost:3010'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

const adminAuthMiddleware = require('./middleware/adminAuthMiddleware'); // Add the middleware
const userAuthMiddleware = require('./middleware/userAuthMiddleware')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Secure only in production
}));

// Middleware to force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Serve static files
app.use('/register', express.static(path.join(__dirname, 'public/register')));
app.use('/user', express.static(path.join(__dirname, 'public/user')));
app.use('/sign-up', signupRoutes);

//Login routes 

// User routes
app.use('/auth', authRoutes);
app.use('/verification',emailVerificationRoutes);
app.use('/verified', userAuthMiddleware('user'),verifiedRoutes);
app.use('/account-settings', accountSettingsRoutes);
app.use('/api/cart',userAuthMiddleware('user'), cartRoutes);
app.use('/user',userAuthMiddleware('user'), userRoutes);
app.use('/store',userAuthMiddleware('user'), storeRoutes);

// Admin routes (protected by adminAuthMiddleware)
app.use('/api/products', adminAuthMiddleware('admin'), productRoutes);  // Protect product management routes
app.use('/gallery-manager', adminAuthMiddleware('admin'), galleryRoutes);  // Protect gallery management routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/gallery', express.static(path.join(__dirname, 'gallery')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Remove the old /admincookies/verify route, since the middleware now handles this

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3450;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
