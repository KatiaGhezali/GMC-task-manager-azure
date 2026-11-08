require("dotenv").config();
const path = require("path");

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const connectDB = require("./config/database");
const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// Security and parsing middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(xss());
app.use(mongoSanitize());

// Initialize Passport
app.use(passport.initialize());

// Basic welcome route
app.get("/", (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next();
  }

  res.status(200).json({
    status: "success",
    message: "Task Manager API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Handle unknown API routes
app.use("/api", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// Google authentication failure
app.get("/auth-failed", (req, res) => {
  res.status(401).json({
    status: "fail",
    message: "Google authentication failed",
  });
});

// Serve the React frontend in production
const clientPath = path.join(__dirname, "client", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientPath));

  // Send the React application for frontend routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// Handle unknown routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// Centralized error handler (has to be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
