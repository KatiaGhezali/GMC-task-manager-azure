const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const verifyToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError("You are not authenticated. Please log in.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user associated with this token no longer exists.",
        401,
      ),
    );
  }

  req.user = currentUser;

  next();
});

module.exports = verifyToken;
