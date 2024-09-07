require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const cartRoutes = require('./routes/cartRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoute');
const productRoutes = require('./routes/productRoutes');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoute');
const galleryRoutes = require('./routes/galleryRoutes');
const checkoutRoutes = require('./routes/checkoutRoute'); 

// Initialize Express app
const app = express();

app.use(cors({
  origin: ['http://localhost:5010', 'http://localhost:4001', 'http://localhost:3010'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Serve static files
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/register', express.static(path.join(__dirname, 'public/register')));
app.use('/user', express.static(path.join(__dirname, 'public/user')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/gallery', express.static(path.join(__dirname, 'gallery')));

// Use routes
app.use('/auth', authRoutes);
app.use('/auth', emailVerificationRoutes); 
app.use('/prp', passwordResetRoutes);
app.use('/api/cart', cartRoutes);

app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api', galleryRoutes);

// Temporarily comment these to test without them
// app.use('/user', userAuthMiddleware(), userRoutes);
// app.use('/admin', adminAuthMiddleware('admin'), adminRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 3450;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
