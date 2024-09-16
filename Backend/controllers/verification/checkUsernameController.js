const User = require('../../models/user'); // Assuming you're using a User model

// Controller function to check if a username is already taken
exports.checkUsernameAvailability = async (req, res) => {
    const { userName } = req.body;

    try {
        // Check if the username exists in the database
        const userExists = await User.findOne({ where: { username: userName } }); // Corrected query
        if (userExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        return res.status(200).json({ message: 'Username is available' });
    } catch (error) {
        return res.status(500).json({ message: 'Error checking username', error: error.message });
    }
};
