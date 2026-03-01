const express = require('express');
const { signupController } = require('./auth.controller');

const router = express.Router();

router.post('/signup', signupController);

module.exports = router;
