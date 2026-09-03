/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`, err.stack);
    
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || "SERVER_ERROR",
            message: message
        }
    });
}

module.exports = errorHandler;