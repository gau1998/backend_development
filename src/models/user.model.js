import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

// Define User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,        // username must be provided
      unique: true,          // no duplicate usernames
      lowercase: true,       // stored in lowercase
      trim: true,            // remove extra spaces
    },
    email: {
      type: String,
      required: true,        // email must be provided
      unique: true,          // no duplicate emails
      lowercase: true,       // stored in lowercase
      trim: true,            // remove extra spaces
    },
    fullName: {
      type: String,
      required: true,        // full name must be provided
      trim: true,
    },
    avatar: {
      type: String,
      required: true,        // profile image is required
    },
    coverImage: {
      type: String,          // optional cover image
    },
    refreshToken: {
      type: String,          // stores refresh token for session handling
    },
    password: {
      type: String,
      required: [true, "Password is required"], // password must be provided
    },
  },
  {
    timestamps: true,        // automatically adds createdAt & updatedAt
  }
);

// 🔒 Hash password before saving user
userSchema.pre("save", async function (next) {
  // If password is not modified, move to next
  if (!this.isModified("password")) return next();

  // Hash the password with bcrypt
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔑 Generate JWT Access Token
userSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h", // expires in 1 hour
  });
};

// 🔑 Generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  const payload = { id: this._id, username: this.username };
  return jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // expires in 7 days
  });
};

// Export User model
export const User = mongoose.model("User", userSchema);
