const asyncHandler = require('../../utils/asyncHandler');

const { createOrder } = require('./orders.service');
const createOrderController = asyncHandler(async (req, res) => {
  const order = await createOrder({
    userId: req.user.id,
    shipping: req.body.shipping,
    items: req.body.items,
  });

  res.status(201).json({
    ok: true,
    order,
  });
});

const { getMyOrders } = require('./orders.service');
const getMyOrdersController = asyncHandler(async (req, res) => {
  const orders = await getMyOrders(req.user.id);

  res.json({
    ok: true,
    orders,
  });
});

module.exports = { createOrderController,getMyOrdersController };
