const express = require('express');
const bcrypt = require('bcryptjs');
const PasswordResetRequest = require('../../models/identify/PasswordResetRequest');
const User = require('../../models/User');
const router = express.Router();

const validatePassword = (password) => {
    const minLength = 6;
    const maxLength = 20;

    if (password.length < minLength || password.length > maxLength) {
        return `Password must be between ${minLength} and ${maxLength} characters long.`;
    }

    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Za-z]).{6,20}$/;
    if (!regex.test(password)) {
        return 'Password must contain at least one number, one letter, and one special character.';
    }

    return null; // No validation errors
}

router.post('/', async (req, res) => {
    const { resetCode, newPassword } = req.body;

    try {
        const passwordResetRequest = await PasswordResetRequest.findOne({ resetCode });

        if (!passwordResetRequest) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (new Date() > new Date(passwordResetRequest.expiresAt)) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        const passwordValidationError = validatePassword(newPassword);
        if (passwordValidationError) {
            return res.status(400).json({ message: passwordValidationError });
        }

        const user = await User.findOne({ email: passwordResetRequest.email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await PasswordResetRequest.deleteOne({ resetCode });

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Error during password reset process:', error);
        res.status(500).json({ message: 'An error occurred, please try again' });
    }
});

module.exports = router;
