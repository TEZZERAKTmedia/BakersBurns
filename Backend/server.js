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
const cron = require('node-cron');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const db = require('./models/index');
const sequelize = require('./config/database'); // Sequelize instance
const helmet = require('helmet');

// Security & Rate Limiting
const {
  lowSecurityRateLimiter,
  mediumSecurityRateLimiter,
  highSecurityRateLimiter
} = require('./utils/rateLimiter'); 

// Import routes
const cartRoutes = require('./routes/user/cartRoutes');
const emailVerificationRoutes = require('./routes/verificationRoutes');
const productRoutes = require('./routes/admin/productRoutes');
const userRoutes = require('./routes/user/userRoutes');
const accountSettingsRoutes = require('./routes/accountSettingsRoutes');
const galleryRoutes = require('./routes/admin/galleryRoutes');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/user/storeRoutes');
const signupRoutes = require('./routes/register/signupRoutes');
const stripeRoutes = require('./routes/user/stripeRoutes');
const stripeWebhookRoutes = require('./routes/user/stripeWebhookRoutes');
const userOrderRoutes = require('./routes/user/orderRoutes');
const registerStoreRoutes = require('./routes/register/storeRegister');
const adminEventRoutes = require('./routes/admin/adminEventRoutes');
const userEventRoutes = require('./routes/user/eventRoutes');
const registerCartRoutes = require('./routes/register/cartRoutes');
const notificationRoutes = require('./routes/admin/notifcationRoutes');
const socialRoutes = require('./routes/register/socialRoutes');
const adminSocialRoutes = require('./routes/admin/adminSocialRoutes');
const adminDiscountRoutes = require('./routes/admin/adminDiscountRoutes');
const googleRoutes = require('./routes/register/googleRoutes');
const invoiceRoutes = require('./routes/admin/invoiceRoutes');

// Middleware
const adminAuthMiddleware = require('./middleware/adminAuthMiddleware'); 
const userAuthMiddleware = require('./middleware/userAuthMiddleware');

// Initialize Express App
const app = express();

// Set CORS Allowed Origins
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [] // CORS handled at NGINX level in production
  : [process.env.USER_FRONTEND, process.env.ADMIN_FRONTEND, process.env.REGISTER_FRONTEND, 'http://localhost:8080'];

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }));
  console.log('CORS middleware enabled for development');
}

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'", "data:",
          process.env.NODE_ENV === "production" ? process.env.USER_FRONTEND : process.env.DEV_USER_URL,
          process.env.NODE_ENV === "production" ? process.env.ADMIN_FRONTEND : process.env.DEV_ADMIN_URL,
          process.env.NODE_ENV === "production" ? process.env.REGISTER_FRONTEND : process.env.DEV_REGISTER_URL,
          process.env.BACKEND_URL,
          process.env.NODE_ENV === "production" ? "https://admin.bakersburns.com" : "http://localhost:5010",
          process.env.NODE_ENV === "production" ? "https://api.bakersburns.com" : "http://localhost:3450",
        ].filter(Boolean),
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// Stripe Webhook (Express must process raw body)
app.use('/stripe-webhook-routes', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

app.use(bodyParser.json());
app.use(cookieParser());

// Session Management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Static File Serving
app.use('/register', express.static(path.join(__dirname, 'public/register')));
app.use('/user', express.static(path.join(__dirname, 'public/user')));
app.use('/sign-up', signupRoutes);
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/socialIcons', express.static(path.resolve(__dirname, 'socialIcons')));
app.use('/galleryuploads', express.static(path.join(__dirname, 'galleryuploads')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/terms-of-service', express.static(path.join(__dirname, 'public/static/terms-of-service.html')));
app.use('/privacy-policy', express.static(path.join(__dirname, 'public/static/privacy-policy.html')));

// Route Middleware
app.use('/invoice-routes', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('invoice-routes'), invoiceRoutes);
app.use('/products', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('admin-products'), productRoutes);
app.use('/gallery-manager', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('gallery-manager'), galleryRoutes);
app.use('/admin-mail', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('admin-mail'), productRoutes);
app.use('/orders', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('orders'), productRoutes);
app.use('/admin-message-routes', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('admin-messaging'), productRoutes);
app.use('/admin-event', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('admin-event'), adminEventRoutes);
app.use('/admin-notifications', adminAuthMiddleware('admin'), notificationRoutes);
app.use('/admin-social', adminSocialRoutes);
app.use('/discount', adminAuthMiddleware('admin'), mediumSecurityRateLimiter('discounts'), adminDiscountRoutes);
app.use('/stripe', lowSecurityRateLimiter('stripe'), stripeRoutes);
app.use('/google', googleRoutes);

// ❌ REMOVED CRON JOB EXECUTION FOR `convert-assets.js` ❌

// Database Connection & Server Start
sequelize.authenticate()
  .then(async () => {
    console.log('✅ Database connected successfully.');

    const ENABLE_SYNC = false;
    if (ENABLE_SYNC) {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    } else {
      console.log('⚠️ Database sync skipped (ENABLE_SYNC = false).');
    }

    console.log("🚀 Initializing order cron job...");
    require('./utils/ordersCronJob')();

    console.log("🚀 Initializing discount cron job...");
    require('./controllers/admin/cron/discountCronJob.js').startDiscountCron();
    
    console.log("🚀 Initializing UPS tracking cron job...");
    require("./controllers/carrier/cronjobs/upsCronJob.js").checkShippedOrders();
    require("./controllers/carrier/cronjobs/uspsCronJob.js").checkShippedOrdersUsps();

    // Start Express Server
    const PORT = process.env.PORT || 3450;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});
