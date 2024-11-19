require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));

app.use(express.json());

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.post('/api/register', async (req, res) => {
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
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            firstName,
            surname,
            dateOfBirth,
            gender,
            email,
            password: hashedPassword
        });

        await user.save();

        // Respond with success message
        res.status(201).json({ message: 'Registration successful!' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});

// Email validation function
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Server start
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
