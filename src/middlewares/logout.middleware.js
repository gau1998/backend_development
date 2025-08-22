import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

/**
 * Middleware to handle logout validation.
 * It checks for a valid access token, verifies it,
 * finds the user, and attaches user info to the request.
 */
const logoutMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Extract access token from cookies OR Authorization header
    const token =
      req.cookies?.accessToken || // Check in cookies
      req.header("Authorization")?.replace("Bearer ", ""); // Check in headers

    // If no token found → Unauthorized
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify token with secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID (excluding sensitive fields)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // If no user found → Invalid token
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach user to request for next middleware/controller
    req.user = user;

    // Continue to next middleware
    next();
  } catch (error) {
    // Handle token verification or DB errors
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { logoutMiddleware };
