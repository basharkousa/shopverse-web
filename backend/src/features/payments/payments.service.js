const { pool } = require('../../config/db');
const AppError = require('../../utils/AppError');
const { updateOrderStatusById } = require('../orders/orders.repo');
const { getOrderByIdForPayment } = require('./payments.repo');

function cleanString(value) {
  return String(value || '').trim();
}

function normalizeOrderId(orderId) {
  const id = Number(orderId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('order_id must be a positive integer', 400);
  }

  return id;
}

function validatePaymentMethod(paymentMethod) {
  const method = cleanString(paymentMethod).toLowerCase();

  if (!method) {
    throw new AppError('payment_method is required', 400);
  }

  if (method !== 'mock') {
    throw new AppError('Only mock payment is supported right now', 400);
  }

  return method;
}

function validateMockCard(card) {
  if (!card || typeof card !== 'object') {
    throw new AppError('card is required', 400);
  }

  const name = cleanString(card.name);
  const number = cleanString(card.number).replace(/\s+/g, '');
  const expiry = cleanString(card.expiry);
  const cvc = cleanString(card.cvc);

  if (!name) throw new AppError('card.name is required', 400);
  if (!number) throw new AppError('card.number is required', 400);
  if (!expiry) throw new AppError('card.expiry is required', 400);
  if (!cvc) throw new AppError('card.cvc is required', 400);

  if (!/^\d{16}$/.test(number)) {
    throw new AppError('card.number must be 16 digits', 400);
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw new AppError('card.expiry must be in MM/YY format', 400);
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    throw new AppError('card.cvc must be 3 or 4 digits', 400);
  }

  return {
    name,
    number,
    expiry,
    cvc,
  };
}

function shouldMockPaymentFail(cardNumber) {
  // Use a simple predictable rule for QA/demo:
  // 4000000000000002 => fail
  return cardNumber === '4000000000000002';
}

async function confirmMockPayment({ userId, orderId, paymentMethod, card }) {
  const normalizedOrderId = normalizeOrderId(orderId);
  const normalizedMethod = validatePaymentMethod(paymentMethod);
  const normalizedCard = validateMockCard(card);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await getOrderByIdForPayment(normalizedOrderId, client);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user_id !== userId) {
      throw new AppError('You are not allowed to pay for this order', 403);
    }

    if (order.status === 'paid') {
      throw new AppError('Order is already paid', 400);
    }

    if (order.status !== 'pending') {
      throw new AppError('Only pending orders can be paid', 400);
    }

    if (shouldMockPaymentFail(normalizedCard.number)) {
      throw new AppError('Mock payment failed', 400);
    }

    const updatedOrder = await updateOrderStatusById(
      normalizedOrderId,
      'paid',
      client
    );

    await client.query('COMMIT');

    return {
      payment: {
        provider: normalizedMethod,
        status: 'paid',
        transaction_id: `mock_${normalizedOrderId}_${Date.now()}`,
      },
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total_cents: updatedOrder.total_cents,
        created_at: updatedOrder.created_at,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  confirmMockPayment,
};
