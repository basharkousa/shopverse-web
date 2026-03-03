const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    const payload = verifyToken(token); // { id, role, iat, exp }
    req.user = payload;
    return next();
  } catch (err) {
    err
    return next(new AppError('Unauthorized', 401));
  }
}

module.exports = requireAuth;
