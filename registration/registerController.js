const bcrypt = require('bcryptjs');
const User = require('../models/User');

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

async function registerUser(req, res) {
    const { firstName, surname, dateOfBirth, gender, email, password } = req.body;

    if (!firstName || !surname || !email || !password || !gender || !dateOfBirth.day || !dateOfBirth.month || !dateOfBirth.year) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            surname,
            dateOfBirth,
            gender,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

module.exports = { registerUser };
