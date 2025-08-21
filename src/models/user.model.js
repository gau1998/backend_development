import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};
userSchema.methods.generateRefreshToken = function () {
  const payload = { id: this._id, username: this.username };
  return jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
