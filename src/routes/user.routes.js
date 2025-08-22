import { Router } from "express";
import { loginUser, registerUser, userLogout } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { logoutMiddleware } from "../middlewares/logout.middleware.js";

// Create a new router instance
const router = Router();

/**
 * @route   POST /api/v1/users/register
 * @desc    Register a new user
 * @access  Public
 * - Handles avatar and coverImage uploads
 */
router.route("/register").post(
  upload.fields([
      {
          name: "avatar",     // Expecting one avatar image
          maxCount: 1
      }, 
      {
          name: "coverImage", // Expecting one cover image
          maxCount: 1
      }
  ]),
  registerUser
);

/**
 * @route   POST /api/v1/users/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.route("/login").post(loginUser);

/**
 * @route   POST /api/v1/users/logout
 * @desc    Logout user by clearing refreshToken
 * @access  Private
 * - Uses logoutMiddleware to verify token before logging out
 */
router.route("/logout").post(logoutMiddleware, userLogout);

// Export router to be used in server.js
export default router;
