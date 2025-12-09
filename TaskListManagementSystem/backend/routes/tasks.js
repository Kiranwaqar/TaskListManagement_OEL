/**
 * Task Routes
 * Handles all CRUD operations for tasks
 */

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // Newest first
    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Task title is required",
      });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: status || "pending",
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (full update)
 * @access  Public
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Task title is required",
      });
    }

    // Validate status if provided
    if (status && !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "pending" or "completed"',
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description ? description.trim() : "",
        status: status || "pending",
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Partially update a task (mark complete/incomplete or edit)
 * @access  Public
 */
router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    const { title, description, status } = req.body;

    // Only update fields that are provided
    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Task title cannot be empty",
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be either "pending" or "completed"',
        });
      }
      updates.status = status;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: {},
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
