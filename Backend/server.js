const path = require('path');

// Load dotenv with environment-specific configuration
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  console.log('Running in Production Mode');
} else {
  require('dotenv').config(); // Defaults to .env in the same directory
  console.log('Running in Development Mode');
}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');




const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); // Assuming JWT is used for auth
const db = require('./models/index');
const sequelize = require('./config/database'); // Import the Sequelize instance
const helmet = require('helmet');
 // Applies all default security headers
const rateLimit = require('express-rate-limit'); 
// Import routes
const cartRoutes = require('./routes/user/cartRoutes');
const emailVerificationRoutes = require('./routes/verificationRoutes');
const productRoutes = require('./routes/admin/productRoutes');
const userRoutes = require('./routes/user/userRoutes');
const accountSettingsRoutes = require('./routes/accountSettingsRoutes');
const galleryRoutes = require('./routes/admin/galleryRoutes');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/user/storeRoutes');
const verifiedRoutes = require('./routes/verifiedRoutes');
const signupRoutes = require('./routes/register/signupRoutes');
const adminMessagingRoutes = require('./routes/admin/adminMessageRoutes');
const userMessagingRoutes = require('./routes/user/userMessagingRoutes');
const adminEmailRoutes = require('./routes/admin/adminEmailRoutes');
const ordersRoutes = require('./routes/admin/ordersRoutes');
const stripeRoutes = require('./routes/user/stripeRoutes');
const passkeyRoutes = require('./routes/admin/adminPasskeyRoutes');
const stripeWebhookRoutes = require('./routes/user/stripeWebhookRoutes');
const userOrderRoutes = require('./routes/user/orderRoutes');
const registerStoreRoutes = require('./routes/register/storeRegister');
const adminEventRoutes = require('./routes/admin/adminEventRoutes');
const userEventRoutes = require('./routes/user/eventRoutes');
const userGalleryRoutes = require('./routes/user/galleryRoutes');
const registerRates = require('./routes/register/rates.js');
const registerCartRoutes = require('./routes/register/cartRoutes');
const notificationRoutes = require('./routes/admin/notifcationRoutes');
const socialRoutes = require('./routes/register/socialRoutes');
const adminSocialRoutes = require('./routes/admin/adminSocialRoutes');
const adminDiscountRoutes = require('./routes/admin/adminDiscountRoutes');
const { rateLimiter } = require('./utils/rateLimiter');
const googleRoutes = require('./routes/register/googleRoutes');
const invoiceRoutes = require('./routes/admin/invoiceRoutes');

 // Assuming passport.js is in the same directory




// Initialize Express app
const app = express();

// Set allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [] // Leave empty since CORS is handled at NGINX level
  : [process.env.USER_FRONTEND, process.env.ADMIN_FRONTEND, process.env.REGISTER_FRONTEND, 'http://localhost:8080'];

if (process.env.NODE_ENV !== 'production') {
  // Only enable CORS middleware in development
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }));
  console.log('CORS middleware enabled for development');
}
app.use(
  helmet({
    crossOriginResourcePolicy: false, // ✅ Allows cross-origin images
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:", // ✅ Allow inline base64 images
          process.env.NODE_ENV === "production"
            ? process.env.USER_FRONTEND
            : process.env.DEV_USER_URL, // ✅ Choose based on environment
          process.env.NODE_ENV === "production"
            ? process.env.ADMIN_FRONTEND
            : process.env.DEV_ADMIN_URL, // ✅ Admin domain (prod/dev)
          process.env.NODE_ENV === "production"
            ? process.env.REGISTER_FRONTEND
            : process.env.DEV_REGISTER_URL, // ✅ Register domain (prod/dev)
          process.env.BACKEND_URL, // ✅ Allow API itself if needed
          process.env.NODE_ENV === "production"
            ? "https://admin.bakersburns.com"
            : "http://localhost:5010", // ✅ Explicitly allow local dev frontend
          process.env.NODE_ENV === "production"
            ? "https://api.bakersburns.com"
            : "http://localhost:3450", // ✅ Local backend access for development
        ].filter(Boolean), // ✅ Removes undefined values if a variable is missing
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // ✅ Adjust for necessary script security
        styleSrc: ["'self'", "'unsafe-inline'"], // ✅ Allow inline styles
      },
    },
  })
);



app.use('/stripe-webhook-routes', express.raw({ type: 'application/json' }), stripeWebhookRoutes);


app.use(bodyParser.json());
app.use(cookieParser());

const adminAuthMiddleware = require('./middleware/adminAuthMiddleware'); // Add the middleware
const userAuthMiddleware = require('./middleware/userAuthMiddleware');

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

//Passkey Routes 
app.use('/login-passkey-routes', rateLimiter('passkey'), passkeyRoutes);


//Register routes
app.use('/register-store', rateLimiter('register-store'), registerStoreRoutes);
app.use('/register-cart', rateLimiter('register-cart'), registerCartRoutes); 
app.use('/register-rates', rateLimiter('register-rates'), registerRates);


// User routes
app.use('/auth', rateLimiter('auth'), authRoutes);
app.use('/verification', rateLimiter('verification'), emailVerificationRoutes);
app.use('/verified', userAuthMiddleware('user'), rateLimiter('verified'), verifiedRoutes);
app.use('/account-settings', rateLimiter('account-settings'), accountSettingsRoutes);
app.use('/cart', userAuthMiddleware('user'), rateLimiter('cart'), cartRoutes);
app.use('/user', userAuthMiddleware('user'), rateLimiter('user'), userRoutes);
app.use('/store', userAuthMiddleware('user'), rateLimiter('store'), storeRoutes);
app.use('/user-message-routes', userAuthMiddleware('user'), rateLimiter('user-messaging'), userMessagingRoutes);
app.use('/user-orders', userAuthMiddleware('user'), rateLimiter('user-orders'), userOrderRoutes);
app.use('/user-event', userAuthMiddleware('user'), rateLimiter('user-event'), userEventRoutes);
app.use('/user-gallery', userAuthMiddleware('user'), rateLimiter('user-gallery'), userGalleryRoutes);
app.use('/user-social', socialRoutes);



//STRIPE ROUTES
app.use('/stripe', rateLimiter('stripe'),stripeRoutes); 

// Google Routes
app.use('/google', googleRoutes);



// Admin routes (protected by adminAuthMiddleware)
app.use('/invoice-routes', adminAuthMiddleware('admin'), rateLimiter('invoice-routes'), invoiceRoutes);
app.use('/products', adminAuthMiddleware('admin'), rateLimiter('admin-products'), productRoutes);
app.use('/gallery-manager', adminAuthMiddleware('admin'), rateLimiter('gallery-manager'), galleryRoutes);
app.use('/admin-mail', adminAuthMiddleware('admin'), rateLimiter('admin-mail'), adminEmailRoutes);
app.use('/orders', adminAuthMiddleware('admin'), rateLimiter('orders'), ordersRoutes);
app.use('/admin-message-routes', adminAuthMiddleware('admin'), rateLimiter('admin-messaging'), adminMessagingRoutes);
app.use('/admin-event', adminAuthMiddleware('admin'), rateLimiter('admin-event'), adminEventRoutes);
app.use('/admin-notifications', adminAuthMiddleware('admin'), notificationRoutes);
app.use('/admin-social', adminSocialRoutes);
app.use('/discount', adminAuthMiddleware('admin'), adminDiscountRoutes);
// Static file serving
// Static file serving
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/socialIcons', express.static(path.resolve(__dirname, 'socialIcons')));


app.use('/galleryuploads', express.static(path.join(__dirname, 'galleryuploads')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/terms-of-service', express.static(path.join(__dirname, 'public/static/terms-of-service.html')));
app.use('/privacy-policy', express.static(path.join(__dirname, 'public/static/privacy-policy.html')));







// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});



//CRON
const { checkShippedOrders } = require("./controllers/carrier/cronjobs/upsCronJob.js");
const { checkShippedOrdersUsps } = require("./controllers/carrier/cronjobs/uspsCronJob.js");
const {startDiscountCron} = require('./controllers/admin/cron/discountCronJob.js');
const cleanupMediaCron = require('./utils/mediaCronJob');
const scheduleCronJob = require('./utils/ordersCronJob');

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Database connected successfully.');

    const ENABLE_SYNC = true; // ✅ Toggle this to false if you don't want to sync

    if (ENABLE_SYNC) {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    } else {
      console.log('⚠️ Database sync skipped (ENABLE_SYNC = false).');
    }

    // ✅ Now it's safe to start cron jobs
    console.log("🚀 Initializing order cron job...");
    scheduleCronJob();
    cleanupMediaCron();

    console.log("🚀 Initializing discount cron job...");
    startDiscountCron();
    
    console.log("🚀 Initializing UPS tracking cron job...");
    checkShippedOrders();
    checkShippedOrdersUsps();

    // ✅ Start the Express server
    const PORT = process.env.PORT || 3450;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit if database connection fails
  });


// Start the server

