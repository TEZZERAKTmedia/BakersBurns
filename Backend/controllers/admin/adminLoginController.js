const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, findUserByEmail } = require('../../models/loginUser');
const { handleFailedLogin, clearFailedAttempts } = require('../../utils/rateLimiter'); 

const loginAdmin = async (req, res) => {
    const { identifier, password } = req.body;

    console.log('Admin login request received with identifier:', identifier);

    // Extract client IP
    let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    if (ip.startsWith('::ffff:')) ip = ip.substring(7);

    try {
        const isEmail = identifier.includes('@');
        const user = isEmail ? await findUserByEmail(identifier) : await findUserByUsername(identifier);

        if (!user || user.role !== 'admin') {
            console.log('Admin not found or not an admin');
            await handleFailedLogin(ip, 'admin-login'); // Track failed attempt
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Password is invalid');
            await handleFailedLogin(ip, 'admin-login'); // Track failed attempt
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // ** Clear all failed login attempts on successful login **
        await clearFailedAttempts(ip, 'admin-login');

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie for admin app
        res.cookie('adminAuthToken', token, {
            httpOnly: true, // Cookie cannot be accessed via client-side JavaScript
            secure: false,  // In development, set to false to allow cookies over HTTP
            maxAge: 60 * 60 * 1000, // 1 hour
            sameSite: 'Strict',
        });

        res.json({ role: user.role }); // Respond with the user's role
    } catch (error) {
        console.error('Admin login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
module.exports = { loginAdmin };
