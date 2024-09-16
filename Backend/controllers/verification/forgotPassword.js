const { sendPasswordResetEmail } = require('../../utils/prEmail');
const { findUserByEmail, createPasswordResetToken } = require('../../models/user');

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
