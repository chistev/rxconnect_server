const express = require('express');
const loginController = require('./controller');
const validateLogin = require('./validate');
const router = express.Router();

router.post('/', validateLogin, loginController);

module.exports = router;
