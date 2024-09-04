const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, findUserByEmail } = require('../models/loginUser');

const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  console.log('Login request received with identifier:', identifier);

  try {
    const isEmail = identifier.includes('@');
    const user = isEmail ? await findUserByEmail(identifier) : await findUserByUsername(identifier);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated token:', token);
    console.log('User role:', user.role);

    let redirectUrl;
    if (user.role === 'admin') {
      redirectUrl = `http://localhost:5010/admin`; // Full URL to admin app
    } else {
      redirectUrl = `http://localhost:4001/user`; // Full URL to user app
    }

    

    console.log('Redirect URL:', redirectUrl);

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
      sameSite: 'Strict',

    });


    res.json({ redirectUrl });

 


  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser };
