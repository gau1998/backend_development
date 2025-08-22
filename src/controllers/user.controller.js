import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avtarlocalpath = req?.files?.avatar[0]?.path;

  const coverImagelocalpath = req?.files?.coverImage[0]?.path;

  if (!avtarlocalpath || !coverImagelocalpath) {
    throw new ApiError(400, "Avatar and cover image are required");
  }

  const avatarfilePath = await uploadOnCloudinary(avtarlocalpath);

  const coverImagefilePath = await uploadOnCloudinary(coverImagelocalpath);

  if (!avatarfilePath || !coverImagefilePath) {
    throw new ApiError(500, "Failed to upload images");
  }
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatarfilePath.url || "",
    coverImage: coverImagefilePath.url || "",
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "User registration failed");
  }
  res
    .status(201)
    .json(new ApiResponse(201, createUser, "User created successfully"));
});

const generateAccessAndRefereshTokens = async(userId) =>{
  console.log("Generating access and refresh tokens for user:", userId);
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAuthToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const loginUser= asyncHandler(async (req, res) => {
 // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

  const { email, password,username } = req.body;
 
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
})

if (!user) {
    throw new ApiError(404, "User does not exist")
}

const isPasswordValid = await user.comparePassword(password)

if (!isPasswordValid) {
throw new ApiError(401, "Invalid user credentials")
}

const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
const loggedInUser = await User.findById(user._id).select(
  "-password -refreshToken"
);
const options ={
  httpOnly: true,
  secure: true
}
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "Login successful")
    );
});
export { registerUser,loginUser };
