const express = require('express');
const jwt = require('jsonwebtoken');
const PasswordResetRequest = require('../models/identify/PasswordResetRequest');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, securityCode } = req.body;

    if (!email || !securityCode) {
        return res.status(400).json({ message: 'Email and security code are required' });
    }

    try {
        const resetRequest = await PasswordResetRequest.findOne({ email, resetCode: securityCode });

        if (!resetRequest) {
            return res.status(400).json({ message: 'Invalid security code' });
        }

        const currentTime = new Date();
        if (currentTime > resetRequest.expiresAt) {
            return res.status(400).json({ message: 'The reset code has expired' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '90m' });

        // Set the JWT token as a HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
            maxAge: 90 * 60 * 1000, // Token expiration time in milliseconds (90 minutes)
            sameSite: 'Strict',
        });

        // Return success response
        res.status(200).json({ message: 'Security code verified successfully, you are logged in.' });
    } catch (error) {
        console.error('Error during password reset verification:', error);
        res.status(500).json({ message: 'Something went wrong, please try again' });
    }
});

module.exports = router;
