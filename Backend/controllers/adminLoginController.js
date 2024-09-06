const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, findUserByEmail} = require('../models/loginUser');

const loginAdmin = async (req, res) => {
    const { identifier, password} = req.body;

    console.log('Admin login request recieved with identifier:', identifier );

    try {
        const isEmail =  identifier.includes('@');
        const user = isEmail ? await findUserByEmail(identifier) : await findUserByUsername(identifier);

        if (!user || user.role !== 'admin') {
            console.log('Admin not found or not an admin');
            return res.status(401).json({ message: 'Invalid admin credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Password is invalid');
            return res.status(401).json({ message: 'Invalid admin credentials'});
        }

        //Generate a JWT token
        const token = jwt.sign(
            { id: user.id, username: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        console.log('Generated token for admin:', token);


        //Set cookie for admin app
        res.cookie('adminAuthToken', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, //1hr
            sameSite: 'Strict',
        });

        //respond with the user's role
        res.json({ role: user.role });
        
    } catch (error) {
        console.error('Admin login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message});
        
    }
};

module.exports = { loginAdmin };
