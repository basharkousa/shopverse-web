// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (err && err.code === '23505') {
    err.statusCode = 400;
    err.message = 'Duplicate value (already exists)';
  }

  if (err && err.code === '23503') {
    err.statusCode = 400;
    err.message = 'Operation blocked by related records';
  }

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    ok: false,
    message: err.message || 'Unexpected error',
    ...(isProd ? {} : { stack: err.stack }),
  });
};
/*
* What it does:

Always returns JSON: { ok:false, message: ... }

In dev, includes stack so you can debug.

In prod, hides stack trace.
* */