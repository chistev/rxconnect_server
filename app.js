require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

    app.post('/api/login', async (req, res) => {
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
    
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '90m' });
    
            // Set the JWT token as a HttpOnly cookie
            res.cookie('token', token, {
                httpOnly: true,  // JavaScript cannot access the cookie
                secure: process.env.NODE_ENV === 'production',  // Only send cookies over HTTPS in production
                maxAge: 90 * 60 * 1000,  // Token expiration time in milliseconds (90 minutes)
                sameSite: 'Strict',  // Cookie should only be sent in first-party contexts
            });
    
            return res.status(200).json({
                message: 'Login successful!',
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error. Please try again later.' });
        }
    });
    

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
