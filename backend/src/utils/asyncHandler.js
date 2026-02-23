module.exports = function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// What it does: wraps an async route so if it throws, it automatically goes to next(err).