const asyncHandler = require('../../utils/asyncHandler');
const { getCategories } = require('./categories.service');

const listCategoriesController = asyncHandler(async (req, res) => {
  const items = await getCategories();

  res.json({
    ok: true,
    items,
    categories: items,
  });
});

module.exports = { listCategoriesController };
