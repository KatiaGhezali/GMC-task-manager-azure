const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    message: "Authentication successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide name, email, and password.", 400));
  }

  if (password.length < 8) {
    return next(
      new AppError("Password must contain at least 8 characters.", 400),
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new AppError("An account with this email already exists.", 409),
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  sendToken(newUser, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password.", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  sendToken(user, 200, res);
});

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// Google OAuth success callback
exports.googleCallback = (req, res) => {
  const token = createToken(req.user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect(process.env.CLIENT_URL);
};
