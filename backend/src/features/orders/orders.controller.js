const asyncHandler = require('../../utils/asyncHandler');
const {
  createOrder,
  getMyOrders,
  getAdminOrdersList,
  getAdminOrderDetails,
  updateAdminOrderStatus,
} = require('./orders.service');

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

const getMyOrdersController = asyncHandler(async (req, res) => {
  const orders = await getMyOrders(req.user.id);

  res.json({
    ok: true,
    orders,
  });
});

const listAdminOrdersController = asyncHandler(async (req, res) => {
  const orders = await getAdminOrdersList();

  res.json({
    ok: true,
    orders,
  });
});

const getAdminOrderDetailsController = asyncHandler(async (req, res) => {
  const order = await getAdminOrderDetails(req.params.id);

  res.json({
    ok: true,
    order,
  });
});

const updateAdminOrderStatusController = asyncHandler(async (req, res) => {
  const order = await updateAdminOrderStatus(req.params.id, req.body.status);

  res.json({
    ok: true,
    message: 'Order status updated successfully',
    order,
  });
});

module.exports = {
  createOrderController,
  getMyOrdersController,
  listAdminOrdersController,
  getAdminOrderDetailsController,
  updateAdminOrderStatusController,
};
