const AppError = require('../../utils/AppError');
const { pool } = require('../../config/db');
const {
  getProductsForOrder,
  insertOrder,
  insertOrderItem,
} = require('./orders.repo');

function cleanString(value) {
  return String(value || '').trim();
}

function validateShipping(shipping) {
  if (!shipping || typeof shipping !== 'object') {
    throw new AppError('shipping is required', 400);
  }

  const name = cleanString(shipping.name);
  const city = cleanString(shipping.city);
  const address = cleanString(shipping.address);
  const phone = cleanString(shipping.phone);

  if (!name) throw new AppError('shipping.name is required', 400);
  if (!city) throw new AppError('shipping.city is required', 400);
  if (!address) throw new AppError('shipping.address is required', 400);
  if (!phone) throw new AppError('shipping.phone is required', 400);

  return { name, city, address, phone };
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('items must not be empty', 400);
  }

  return items.map((item) => {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new AppError('product_id must be a positive integer', 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('quantity must be >= 1', 400);
    }

    return { product_id: productId, quantity };
  });
}

async function createOrder({ userId, shipping, items }) {
  const cleanShipping = validateShipping(shipping);
  const normalizedItems = normalizeItems(items);

  const mergedMap = new Map();
  for (const item of normalizedItems) {
    const existing = mergedMap.get(item.product_id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      mergedMap.set(item.product_id, { ...item });
    }
  }

  const mergedItems = Array.from(mergedMap.values());
  const productIds = mergedItems.map((item) => item.product_id);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const dbProducts = await getProductsForOrder(productIds, client);

    if (dbProducts.length !== productIds.length) {
      throw new AppError('One or more products were not found', 400);
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalCents = 0;
    const preparedItems = mergedItems.map((item) => {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new AppError(`Product ${item.product_id} not found`, 400);
      }

      if (
        typeof product.stock_qty === 'number' &&
        item.quantity > product.stock_qty
      ) {
        throw new AppError(
          `Requested quantity exceeds stock for product ${product.id}`,
          400
        );
      }

      const unitPriceCents = product.price_cents;
      totalCents += unitPriceCents * item.quantity;

      return {
        product_id: product.id,
        title: product.title,
        quantity: item.quantity,
        unit_price_cents: unitPriceCents,
        line_total_cents: unitPriceCents * item.quantity,
      };
    });

    const order = await insertOrder(
      {
        userId,
        status: 'pending',
        totalCents,
      },
      client
    );

    for (const item of preparedItems) {
      await insertOrderItem(
        {
          orderId: order.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        },
        client
      );
    }

    await client.query('COMMIT');

    return {
      id: order.id,
      status: order.status,
      total_cents: order.total_cents,
      created_at: order.created_at,
      shipping: cleanShipping,
      items: preparedItems,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const { getOrdersByUserId } = require('./orders.repo');

async function getMyOrders(userId) {
  return getOrdersByUserId(userId);
}

module.exports = { createOrder, getMyOrders };
