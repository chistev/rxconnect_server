const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
