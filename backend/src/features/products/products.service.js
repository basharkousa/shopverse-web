const AppError = require('../../utils/AppError');
const {
  countProducts,
  listProducts,
  getProductById,
  buildOrder,
  listAdminProducts,
  getCategoryById,
  createProduct,
  updateProductById,
  deleteProductById,
} = require('./products.repo');

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

function buildWhere({ q, category, minPrice, maxPrice, minRating }) {
  const params = [];
  const clauses = [];

  const query = String(q || '').trim();
  if (query) {
    params.push(`%${query}%`);
    params.push(`%${query}%`);
    clauses.push(
      `(p.title ILIKE $${params.length - 1} OR p.description ILIKE $${params.length})`
    );
  }

  if (
    category !== undefined &&
    category !== null &&
    String(category).trim() !== ''
  ) {
    const catId = Number(category);
    if (!Number.isInteger(catId) || catId <= 0) {
      throw new AppError('category must be a positive integer', 400);
    }
    params.push(catId);
    clauses.push(`p.category_id = $${params.length}`);
  }

  if (
    minPrice !== undefined &&
    minPrice !== null &&
    String(minPrice).trim() !== ''
  ) {
    const min = Number(minPrice);
    if (!Number.isFinite(min) || min < 0) {
      throw new AppError('minPrice must be a number >= 0', 400);
    }
    params.push(Math.floor(min));
    clauses.push(`p.price_cents >= $${params.length}`);
  }

  if (
    maxPrice !== undefined &&
    maxPrice !== null &&
    String(maxPrice).trim() !== ''
  ) {
    const max = Number(maxPrice);
    if (!Number.isFinite(max) || max < 0) {
      throw new AppError('maxPrice must be a number >= 0', 400);
    }
    params.push(Math.floor(max));
    clauses.push(`p.price_cents <= $${params.length}`);
  }

  if (
    minRating !== undefined &&
    minRating !== null &&
    String(minRating).trim() !== ''
  ) {
    const r = Number(minRating);
    if (!Number.isFinite(r) || r < 0 || r > 5) {
      throw new AppError('minRating must be between 0 and 5', 400);
    }
    params.push(r);
    clauses.push(`p.rating >= $${params.length}`);
  }

  const minP = String(minPrice || '').trim();
  const maxP = String(maxPrice || '').trim();
  if (minP && maxP) {
    const a = Number(minP);
    const b = Number(maxP);
    if (Number.isFinite(a) && Number.isFinite(b) && a > b) {
      throw new AppError('minPrice cannot be greater than maxPrice', 400);
    }
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereSql, params };
}

function cleanString(value) {
  return String(value || '').trim();
}

function cleanNullableText(value) {
  const v = String(value || '').trim();
  return v || null;
}

async function validateAndNormalizeProductInput(payload) {
  const title = cleanString(payload.title);
  const description = cleanNullableText(payload.description);
  const imageUrl = cleanNullableText(payload.image_url);

  const priceCents = Number(payload.price_cents);
  const categoryId = Number(payload.category_id);
  const stockQty = Number(payload.stock_qty);

  const ratingRaw =
    payload.rating === undefined ||
    payload.rating === null ||
    payload.rating === ''
      ? 0
      : Number(payload.rating);

  if (!title) {
    throw new AppError('title is required', 400);
  }

  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new AppError('price_cents must be an integer >= 0', 400);
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new AppError('category_id must be a positive integer', 400);
  }

  if (!Number.isInteger(stockQty) || stockQty < 0) {
    throw new AppError('stock_qty must be an integer >= 0', 400);
  }

  if (!Number.isFinite(ratingRaw) || ratingRaw < 0 || ratingRaw > 5) {
    throw new AppError('rating must be between 0 and 5', 400);
  }

  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new AppError('category_id does not exist', 400);
  }

  return {
    title,
    description,
    priceCents,
    imageUrl,
    categoryId,
    rating: Number(ratingRaw.toFixed(1)),
    stockQty,
  };
}

async function getProducts({
  page,
  limit,
  q,
  category,
  minPrice,
  maxPrice,
  minRating,
  sort,
}) {
  const safePage = parsePositiveInt(page, 1);
  const safeLimit = parsePositiveInt(limit, 12);

  if (safeLimit > 50) {
    throw new AppError('limit must be <= 50', 400);
  }

  const offset = (safePage - 1) * safeLimit;
  const { whereSql, params } = buildWhere({
    q,
    category,
    minPrice,
    maxPrice,
    minRating,
  });

  const totalItems = await countProducts({ whereSql, params });
  const orderSql = buildOrder(sort);
  const items = await listProducts({
    whereSql,
    params,
    limit: safeLimit,
    offset,
    orderSql,
  });

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
  };
}

async function getProductDetails(id) {
  const pid = Number(id);
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new AppError('id must be a positive integer', 400);
  }

  const product = await getProductById(pid);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

async function getAdminProducts() {
  return await listAdminProducts();
}

async function createAdminProduct(payload) {
  const normalized = await validateAndNormalizeProductInput(payload);
  return await createProduct(normalized);
}

async function updateAdminProduct(id, payload) {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError('id must be a positive integer', 400);
  }

  const existing = await getProductById(productId);
  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  const normalized = await validateAndNormalizeProductInput(payload);
  return await updateProductById(productId, normalized);
}

async function deleteAdminProduct(id) {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError('id must be a positive integer', 400);
  }

  const existing = await getProductById(productId);
  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  try {
    await deleteProductById(productId);
  } catch (err) {
    if (err.code === '23503') {
      throw new AppError(
        'Cannot delete product because it is referenced by existing orders',
        400
      );
    }
    throw err;
  }

  return {
    id: existing.id,
    title: existing.title,
  };
}

module.exports = {
  getProducts,
  getProductDetails,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
};
