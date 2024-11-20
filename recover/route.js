const express = require('express');
const PasswordResetRequest = require('../models/identify/PasswordResetRequest');
const User = require('../models/User');
const { generateAndSetToken } = require('../utils/jwt');
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

        await PasswordResetRequest.deleteOne({ _id: resetRequest._id });

        generateAndSetToken(res, user._id);
        res.status(200).json({ message: 'Security code verified successfully, you are logged in.' });
    } catch (error) {
        console.error('Error during password reset verification:', error);
        res.status(500).json({ message: 'Something went wrong, please try again' });
    }
});

module.exports = router;
