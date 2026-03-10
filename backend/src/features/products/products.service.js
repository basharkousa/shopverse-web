const AppError = require('../../utils/AppError');
const { countProducts, listProducts,getProductById, buildOrder } = require('./products.repo');

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

function buildWhere({ q, category, minPrice, maxPrice, minRating,}) {
  const params = [];
  const clauses = [];

  // ----- Search -----
  const query = String(q || '').trim();
  if (query) {
    params.push(`%${query}%`);
    params.push(`%${query}%`);
    clauses.push(
      `(p.title ILIKE $${params.length - 1} OR p.description ILIKE $${params.length})`
    );
  }

  // ----- Category filter -----
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

  // ----- Price range filters (cents) -----
  if (
    minPrice !== undefined &&
    minPrice !== null &&
    String(minPrice).trim() !== ''
  ) {
    const min = Number(minPrice);
    if (!Number.isFinite(min) || min < 0)
      throw new AppError('minPrice must be a number >= 0', 400);
    params.push(Math.floor(min));
    clauses.push(`p.price_cents >= $${params.length}`);
  }

  if (
    maxPrice !== undefined &&
    maxPrice !== null &&
    String(maxPrice).trim() !== ''
  ) {
    const max = Number(maxPrice);
    if (!Number.isFinite(max) || max < 0)
      throw new AppError('maxPrice must be a number >= 0', 400);
    params.push(Math.floor(max));
    clauses.push(`p.price_cents <= $${params.length}`);
  }

  // ----- Rating filter -----
  if (
    minRating !== undefined &&
    minRating !== null &&
    String(minRating).trim() !== ''
  ) {
    const r = Number(minRating);
    if (!Number.isFinite(r) || r < 0 || r > 5)
      throw new AppError('minRating must be between 0 and 5', 400);
    params.push(r);
    clauses.push(`p.rating >= $${params.length}`);
  }

  // Validate min/max relationship if both exist
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

async function getProducts({
  page,
  limit,
  q,
  category,
  minPrice,
  maxPrice,
  minRating,
  sort
}) {
  const safePage = parsePositiveInt(page, 1);
  const safeLimit = parsePositiveInt(limit, 12);

  // optional: protect server from huge limits
  if (safeLimit > 50) throw new AppError('limit must be <= 50', 400);

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
  if (!product) throw new AppError('Product not found', 404);

  return product;
}

module.exports = { getProducts, getProductDetails };
