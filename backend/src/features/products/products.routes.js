const express = require('express');
const {
  listProductsController,
  getProductDetailsController,
} = require('./products.controller');

const router = express.Router();

router.get('/', listProductsController);
router.get('/:id', getProductDetailsController);

module.exports = router;
