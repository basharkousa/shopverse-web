class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
// What it does: lets you throw errors with a specific HTTP status (like 400, 401, 404).
module.exports = AppError;