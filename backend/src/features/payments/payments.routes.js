const express = require('express');
const requireAuth = require('../../middlewares/requireAuth');
const { confirmMockPaymentController } = require('./payments.controller');

const router = express.Router();

router.post('/mock-confirm', requireAuth, confirmMockPaymentController);

module.exports = router;
