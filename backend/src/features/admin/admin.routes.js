const express = require('express');
const requireAdmin = require('../../middlewares/requireAdmin');
const {
  listAdminProductsController,
  createAdminProductController,
  updateAdminProductController,
  deleteAdminProductController,
} = require('../products/products.controller');
const {
  listAdminOrdersController,
  getAdminOrderDetailsController,
  updateAdminOrderStatusController,
} = require('../orders/orders.controller');

const router = express.Router();

router.use(requireAdmin);

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Admin routes ready',
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

router.get('/products', listAdminProductsController);
router.post('/products', createAdminProductController);
router.put('/products/:id', updateAdminProductController);
router.delete('/products/:id', deleteAdminProductController);

router.get('/orders', listAdminOrdersController);
router.get('/orders/:id', getAdminOrderDetailsController);
router.put('/orders/:id/status', updateAdminOrderStatusController);

module.exports = router;
