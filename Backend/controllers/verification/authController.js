const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const sendVerificationEmail = require('../../utils/buildEmail');

const signup = async (req, res) => {
    try {
        const { userName, email, password, phoneNumber } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'It looks like your email is already in our system. Please log in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();

        const newUser = await User.create({
            username: userName,
            email,
            password: hashedPassword,
            phoneNumber,
            verificationToken,
            isVerified: false
        });

        const emailSent = await sendVerificationEmail(email, verificationToken);
        if (!emailSent) {
            return res.status(500).json({ message: "Error sending verification email" });
        }

        res.json({ message: "User registered successfully. Please verify your email." });
    } catch (error) {
        console.error("Signup error:", error); 
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { email, token } = req.query;

    try {
        const user = await User.findOne({ where: { email, verificationToken: token } });
        if (!user) {
            return res.status(400).send('Invalid verification link.');
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.send('Email verified successfully. You can now log in.');
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).send('An error occurred while verifying the user.');
    }
};

const checkUserRole = async (req, res) => {
    try {
        const { role } = req.user;
        const user = await User.findByPk(req.user.id);

        if(!user){
            return res.status(404).json({ message: 'User not found'})
        }

        return res.status(200).json({ role })
    } catch (error) {
        console.error('Error checking user role:', error.message);
        return res.status(500).json({ message: 'Error checking user role', error: error.message});
        
    }
}

module.exports = {
    signup,
    verifyEmail, 
    checkUserRole
};
