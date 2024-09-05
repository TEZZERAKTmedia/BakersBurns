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
            return res.status(401),json({ message: 'Invalid admin credentials'});
        }
        
    } catch (error) {
        
    }
}
