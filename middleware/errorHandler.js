const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500,
    );
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

module.exports = errorHandler;
