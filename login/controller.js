const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAndSetToken } = require('../utils/jwt');

const loginController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        generateAndSetToken(res, user._id);
        return res.status(200).json({ message: 'Login successful!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

module.exports = loginController;
