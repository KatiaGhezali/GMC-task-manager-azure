const express = require("express");

const {
  createTask,
  getTasks,
  deleteTask,
} = require("../controllers/taskController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// All task routes require authentication
router.use(verifyToken);

router.route("/").post(createTask).get(getTasks);

router.route("/:id").delete(deleteTask);

module.exports = router;
