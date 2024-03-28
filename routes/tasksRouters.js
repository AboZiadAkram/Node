const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const Task = require("../models/Task");
const mongoose = require("mongoose");
const { check, validationResult } = require('express-validator');

// Create a new task
router.post("/",  [
  verifyToken,
  check('title').notEmpty().withMessage('Title is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('status').isIn(['pending', 'ongoing', 'completed']).withMessage('Invalid status'),
  check('dueDate').isISO8601().withMessage('Invalid dueDate'),
  check('category').isMongoId().withMessage('Invalid category'),
], async (req, res, next) => {
  const { title, description, status, dueDate, category } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //If one of the fields is empty, return an error message
  if (!title || !description || !status || !dueDate || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newTask = new Task({
    title,
    description,
    status,
    dueDate,
    category,
    user: req.userId,
  });
  
  newTask._id = new mongoose.Types.ObjectId();

  try {
    const savedTask = await newTask.save();
    res.json({ message: "Task created", task: savedTask });
  } catch (error) {
    next(error);
  }
});

// Get all tasks
router.get("/", [
  verifyToken,
  check('categoryId').optional().isMongoId().withMessage('Invalid categoryId'),
  check('status').optional().isIn(['pending', 'ongoing', 'completed']).withMessage('Invalid status'),
  check('dueDate').optional().isISO8601().withMessage('Invalid dueDate'),
  check('page').optional().isInt({ gt: 0 }).withMessage('Page must be greater than 0'),
  check('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be greater than 0'),
], async (req, res, next) => {
  try {
    const query = {};
        const options = {};

        if (req.query.categoryId) {
            query.category = req.query.categoryId;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.dueDate) {
            query.dueDate = new Date(req.query.dueDate);
        }

        if (req.query.page) {
            options.page = parseInt(req.query.page);
        }

        if (req.query.limit) {
            options.limit = parseInt(req.query.limit);
        }

        const tasks = await Task.paginate(query, options);

        if (tasks.docs.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }

        res.json({ message: "Tasks fetched", tasks });
  } catch (error) {
    next(error);
  }
});

// Get one task
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task fetched", task });
  } catch (error) {
    next(error);
  }
});

// Update one task
router.patch("/:id",  [
  verifyToken,
  check('title').notEmpty().withMessage('Title is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('status').isIn(['pending', 'ongoing', 'completed']).withMessage('Invalid status'),
  check('dueDate').isISO8601().withMessage('Invalid dueDate'),
  check('category').isMongoId().withMessage('Invalid category'),
], async (req, res, next) => {
  const { title, description, status, dueDate, category } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!title || !description || !status || !dueDate || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const updatedTask = { title, description, status, dueDate, category, user: req.userId };

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.set(updatedTask);
    await task.validate();

    await task.save();
    res.json({ message: "Task updated" });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Delete one task
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;