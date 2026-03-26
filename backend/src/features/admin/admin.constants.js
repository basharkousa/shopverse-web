const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

function isValidOrderStatus(value) {
  return ORDER_STATUSES.includes(
    String(value || '')
      .trim()
      .toLowerCase()
  );
}

module.exports = {
  ORDER_STATUSES,
  isValidOrderStatus,
};
