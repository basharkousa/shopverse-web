const asyncHandler = require('../../utils/asyncHandler');
const { getProducts, getProductDetails } = require('./products.service');

const listProductsController = asyncHandler(async (req, res) => {
  const result = await getProducts({
    page: req.query.page,
    limit: req.query.limit,
    q: req.query.q,
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    minRating: req.query.minRating,
    sort: req.query.sort,
  });

  res.json({ ok: true, ...result });
});

const getProductDetailsController = asyncHandler(async (req, res) => {
  const product = await getProductDetails(req.params.id);
  res.json({ ok: true, product });
});

module.exports = {
  listProductsController,
  getProductDetails,
  getProductDetailsController,
};
