// A higher-order function to handle async route/controller functions safely
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Wrap the requestHandler in Promise.resolve()
        // If the function throws an error or rejects, catch() will handle it
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); 
            // Passes the error to Express's built-in error handler (via next)
    }
}

export { asyncHandler };
