require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

// Import routes
const authRoutes = require('./routes/authRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoute');
const galleryRoutes = require('./routes/galleryRoutes');

const userAuthMiddleware = require('./middleware/userAuthMiddleware');
const adminAuthMiddleware = require('./middleware/adminAuthMiddleware');

// Initialize Express app
const app = express();

const corsOptions = {
  origin: ['http://localhost:5010', 'http://localhost:4001', 'http://localhost:3010'], // List of allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Serve static files for each app
if (process.env.NODE_ENV === 'development') {
  app.use('/admin', express.static(path.join(__dirname, '..', '..', 'FrontEnd', 'adminFrontEnd', 'dist')));
  app.use('/register', express.static(path.join(__dirname, '..', '..', 'FrontEnd', 'registerFrontEnd', 'dist')));
  app.use('/user', express.static(path.join(__dirname, '..', '..', 'FrontEnd', 'userFrontEnd', 'dist')));
} else {
  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
  app.use('/register', express.static(path.join(__dirname, 'public/register')));
  app.use('/user', express.static(path.join(__dirname, 'public/user')));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/gallery', express.static(path.join(__dirname, 'gallery'))); // Serve gallery folder

// Use routes for different parts of the application
app.use('/auth', authRoutes);
app.use('/prp', passwordResetRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api', galleryRoutes); // Use the gallery routes under /api path

app.use('/user', userAuthMiddleware(), userRoutes);
app.use('/admin', adminAuthMiddleware('admin'), adminRoutes);

// Handle React routing, return all requests to the appropriate React app's index.html
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    if (req.path.startsWith('/admin')) {
      res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'adminFrontEnd', 'dist', 'index.html'));
    } else if (req.path.startsWith('/register')) {
      res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'registerFrontEnd', 'dist', 'index.html'));
    } else if (req.path.startsWith('/user')) {
      res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'userFrontEnd', 'dist', 'index.html'));
    } else {
      res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'registerFrontEnd', 'dist', 'index.html'));
    }
  } else {
    if (req.path.startsWith('/admin')) {
      res.sendFile(path.join(__dirname, 'public/admin', 'index.html'));
    } else if (req.path.startsWith('/register')) {
      res.sendFile(path.join(__dirname, 'public/register', 'index.html'));
    } else if (req.path.startsWith('/user')) {
      res.sendFile(path.join(__dirname, 'public/user', 'index.html'));
    } else {
      res.sendFile(path.join(__dirname, 'public/register', 'index.html'));
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('An error occurred:', err.message);
  res.status(500).json({ message: 'An internal server error occurred', error: err.message });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the server
const PORT = process.env.PORT || 3450;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
