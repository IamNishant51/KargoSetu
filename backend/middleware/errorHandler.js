/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`, err.stack);
    
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        error: "Server Error",
        message: message,
    });
}

module.exports = errorHandler;