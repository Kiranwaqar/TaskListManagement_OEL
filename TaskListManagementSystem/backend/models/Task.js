/**
 * Task Model
 * Defines the schema for tasks in MongoDB
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Task description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
