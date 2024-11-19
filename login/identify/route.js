const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../../models/User');
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
            reset_link: `https://yourwebsite.com/reset-password?code=${resetCode}`,
            firstname: firstName,
        },
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
            'charset': 'iso-8859-1'
        }
    };

    console.log("Sending email to:", email);
    console.log("Reset code:", resetCode);
    console.log("User's first name:", firstName);

    try {
        console.log("Making request to Brevo API...");

        const response = await axios.post(url, data, {
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json'
            }
        });

        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Log the full response from Brevo API to see error details
            console.error('Error sending email - Response:', error.response.data);
        } else {
            // Log the error message if no response is received
            console.error('Error sending email - Message:', error.message);
        }
        throw new Error('Failed to send email');
    }
};

// Handle password reset request
router.post('/', async (req, res) => {
    const { email } = req.body;

    console.log("Received password reset request for email:", email);

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        console.log('Invalid email address:', email);
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        // Check if user exists in the database
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(404).json({ message: 'Email address not found' });
        }

        // Generate a random reset code (6-digit)
        const resetCode = crypto.randomInt(100000, 999999).toString();
        console.log("Generated reset code:", resetCode);

        // Send the reset code email with the user's first name
        const emailResponse = await sendPasswordResetEmail(email, resetCode, user.firstName);

        // Optionally, save the reset code and email to your DB if needed

        console.log('Password reset email sent successfully:', emailResponse);
        res.status(200).json({ message: 'Password reset email sent!' });

    } catch (error) {
        console.error('Error processing password reset request:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
});

module.exports = router;
