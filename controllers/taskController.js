const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a task
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError("Task title is required.", 400));
  }

  const task = await Task.create({
    title,
    description,
    owner: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.getTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({
    owner: req.user._id,
  });

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(
      new AppError(
        "Task not found or you do not have permission to delete it.",
        404,
      ),
    );
  }

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
