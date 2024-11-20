const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../../models/User');
const PasswordResetRequest = require('../../models/identify/PasswordResetRequest');
const router = express.Router();

const API_KEY = process.env.BREVO_API_KEY;

const sendPasswordResetEmail = async (email, resetCode, firstName) => {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    const data = {
        to: [
            {
                email: email,
                name: firstName,
            }
        ],
        templateId: 1,
        params: {
            reset_code: resetCode,
            reset_link: `http://localhost:5173/recover/password?code=${resetCode}`,
            firstname: firstName,
        },
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
            'charset': 'iso-8859-1'
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error sending email - Response:', error.response.data);
        } else {
            console.error('Error sending email - Message:', error.message);
        }
        throw new Error('Failed to send email');
    }
};

router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'Email address not found' });
        }

        const resetCode = crypto.randomInt(100000, 999999).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);

        // Delete any existing reset request for the user (to replace it with a new one)
        await PasswordResetRequest.deleteOne({ email: email });

        const resetRequest = new PasswordResetRequest({
            email: email,
            resetCode: resetCode,
            expiresAt: expiresAt
        });
        await resetRequest.save();

        await sendPasswordResetEmail(email, resetCode, user.firstName);

        res.status(200).json({ message: 'Password reset email sent!' });

    } catch (error) {
        console.error('Error processing password reset request:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
});

module.exports = router;