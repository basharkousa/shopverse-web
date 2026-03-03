const AppError = require('../utils/AppError');
const requireAuth = require('./requireAuth');

function requireAdmin(req, res, next) {
  // 1) Ensure user is authenticated first
  requireAuth(req, res, (err) => {
    if (err) return next(err);

    // 2) Check admin role
    if (req.user?.role !== 'admin') {
      return next(new AppError('Forbidden: admin only', 403));
    }

    return next();
  });
}

module.exports = requireAdmin;
