const express = require('express');

const requireAuth = require('../../middlewares/requireAuth');

const { signupController, loginController, meController } = require('./auth.controller');

const router = express.Router();

router.post('/signup', signupController);

router.post('/login', loginController);

router.get('/me', requireAuth, meController);

module.exports = router;
