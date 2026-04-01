const asyncHandler = require('../../utils/asyncHandler');
const { confirmMockPayment } = require('./payments.service');

const confirmMockPaymentController = asyncHandler(async (req, res) => {
  const result = await confirmMockPayment({
    userId: req.user.id,
    orderId: req.body.order_id,
    paymentMethod: req.body.payment_method,
    card: req.body.card,
  });

  res.json({
    ok: true,
    message: 'Payment confirmed successfully',
    payment: result.payment,
    order: result.order,
  });
});

module.exports = {
  confirmMockPaymentController,
};
