const { body, validationResult } = require('express-validator');

const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters long.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateLogin;
