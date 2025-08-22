// A standard API Response class to ensure consistent response structure
class ApiResponse {
    /**
     * Creates a new ApiResponse instance
     * @param {number} statusCode - HTTP status code (e.g., 200, 201, 400, 500)
     * @param {any} data - Response payload (can be object, array, string, etc.)
     * @param {string} [message="Success"] - Response message (default is "Success")
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;   // HTTP status code of the response
        this.data = data;               // The actual response data
        this.message = message;         // A message describing the response
        this.success = statusCode < 400 // Boolean flag: true if success, false if error
    }
}

export { ApiResponse };
