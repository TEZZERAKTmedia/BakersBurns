const { sendPasswordResetEmail } = require('../utils/prEmail');
const { findUserByEmail, createPasswordResetToken, updateUserPassword } = require('../models/user');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log(`Received password reset request for email: ${email}`);

    try {
        const user = await findUserByEmail(email);
        console.log(`User found: ${user ? user.id : 'No user found'}`);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = await createPasswordResetToken(user.id);
        console.log(`Reset token created: ${resetToken}`);

        await sendPasswordResetEmail(email, resetToken);
        console.log('Password reset email sent successfully');

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    console.log(`Received password reset with token: ${token}`);

    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE resetToken = ?', [token]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = rows[0];
        const now = new Date();
        if (now > new Date(user.resetTokenExpires)) {
            return res.status(400).json({ message: 'Token expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await updateUserPassword(user.email, hashedPassword);
        await pool.query('UPDATE Users SET resetToken = NULL, resetTokenExpires = NULL WHERE id = ?', [user.id]);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
