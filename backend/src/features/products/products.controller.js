const asyncHandler = require('../../utils/asyncHandler');
const {
  getProducts,
  getProductDetails,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} = require('./products.service');

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

const listAdminProductsController = asyncHandler(async (req, res) => {
  const items = await getAdminProducts();
  res.json({ ok: true, items });
});

const createAdminProductController = asyncHandler(async (req, res) => {
  const product = await createAdminProduct(req.body);
  res.status(201).json({ ok: true, product });
});

const updateAdminProductController = asyncHandler(async (req, res) => {
  const product = await updateAdminProduct(req.params.id, req.body);
  res.json({ ok: true, product });
});

const deleteAdminProductController = asyncHandler(async (req, res) => {
  const deleted = await deleteAdminProduct(req.params.id);
  res.json({
    ok: true,
    message: 'Product deleted successfully',
    deleted,
  });
});

module.exports = {
  listProductsController,
  getProductDetailsController,
  listAdminProductsController,
  createAdminProductController,
  updateAdminProductController,
  deleteAdminProductController,
};
