import { asyncHandler } from "../utils/asyncHandler.js"; // Middleware to handle async errors
import { ApiError } from "../utils/ApiError.js"; // Custom error class
import { User } from "../models/user.model.js"; // User mongoose model
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Helper for image upload
import { ApiResponse } from "../utils/ApiResponse.js"; // Custom response formatter

// ================= REGISTER SECTION =================
const registerUser = asyncHandler(async (req, res) => {
  // Destructure required fields from request body
  const { username, email, fullName, password } = req.body;

  // Check if any field is missing or empty
  if (
    [username, email, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if username OR email already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Extract uploaded avatar and cover image file paths
  const avtarlocalpath = req?.files?.avatar[0]?.path;
  const coverImagelocalpath = req?.files?.coverImage[0]?.path;

  // Both avatar and cover image are mandatory
  if (!avtarlocalpath || !coverImagelocalpath) {
    throw new ApiError(400, "Avatar and cover image are required");
  }

  // Upload images to Cloudinary
  const avatarfilePath = await uploadOnCloudinary(avtarlocalpath);
  const coverImagefilePath = await uploadOnCloudinary(coverImagelocalpath);

  if (!avatarfilePath || !coverImagefilePath) {
    throw new ApiError(500, "Failed to upload images");
  }

  // Create a new user in the database
  const user = await User.create({
    username: username.toLowerCase(), // Store username in lowercase for consistency
    email,
    fullName,
    password,
    avatar: avatarfilePath.url || "",
    coverImage: coverImagefilePath.url || "",
  });

  // Fetch the newly created user without password and refreshToken
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "User registration failed");
  }

  // Send success response
  res
    .status(201)
    .json(new ApiResponse(201, createUser, "User created successfully"));
});
// ================= END OF REGISTER SECTION =================


// ================= LOGIN SECTION =================

// Function to generate access and refresh tokens for a given userId
const generateAccessAndRefereshTokens = async (userId) => {
  console.log("Generating access and refresh tokens for user:", userId);

  try {
    const user = await User.findById(userId);

    // Generate tokens using model methods
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// Login user controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  // Check if required fields are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Compare password with hashed password in DB
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // Fetch user without password and refreshToken
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true, // Prevents access to cookie via JS
    secure: true,   // Ensures cookie is only sent over HTTPS
  };

  // Send response with cookies + tokens
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});
// ================= END OF LOGIN SECTION =================


// ================= LOGOUT SECTION =================
const userLogout = asyncHandler(async (req, res) => {
  const user = req.user; // Get user from middleware (auth)

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Remove refresh token from DB
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  // Clear cookies from client
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out"));
});
// ================= END OF LOGOUT SECTION =================

export { registerUser, loginUser, userLogout };
