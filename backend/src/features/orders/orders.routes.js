const express = require('express');
const requireAuth = require('../../middlewares/requireAuth');


const { createOrderController,getMyOrdersController } = require('./orders.controller');

const router = express.Router();

router.post('/', requireAuth, createOrderController);
router.get('/my', requireAuth, getMyOrdersController);

module.exports = router;
