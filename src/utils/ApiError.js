// Custom API Error class extending the built-in Error object
class ApiError extends Error {
    /**
     * Creates a new ApiError instance
     * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
     * @param {string} [message="Something went wrong"] - Error message to display
     * @param {Array} [errors=[]] - Additional error details (e.g., validation errors)
     * @param {string} [stack=""] - Optional custom stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Call parent Error class with the message
        super(message);

        // Attach custom properties
        this.statusCode = statusCode;  // HTTP status code for the error
        this.data = null;              // Placeholder for additional data if needed
        this.message = message;        // Error message
        this.success = false;          // Always false for errors
        this.errors = errors;          // Array of detailed errors (if any)

        // Handle stack trace
        if (stack) {
            // Use provided stack trace
            this.stack = stack;
        } else {
            // Capture stack trace from where the error was thrown
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
