const jwt = require('jsonwebtoken');

const generateAndSetToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '90m' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 60 * 1000,
        sameSite: 'Strict',
    });
};

module.exports = { generateAndSetToken };
