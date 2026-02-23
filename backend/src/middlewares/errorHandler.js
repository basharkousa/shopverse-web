module.exports = function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;

    // Avoid leaking internal details in production
    const isProd = process.env.NODE_ENV === "production";

    res.status(statusCode).json({
        ok: false,
        message: err.message || "Unexpected error",
        ...(isProd ? {} : { stack: err.stack }),
    });
};

/*
* What it does:

Always returns JSON: { ok:false, message: ... }

In dev, includes stack so you can debug.

In prod, hides stack trace.
* */