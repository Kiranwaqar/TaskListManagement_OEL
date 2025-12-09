/**
 * UserStats Model
 * Stores user statistics including badges, streaks, and points
 */

const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: Date,
    default: null,
  },
});

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "default", // For single-user app, use "default"
      unique: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    badges: [badgeSchema],
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Initialize default badges
userStatsSchema.statics.getDefaultBadges = function () {
  return [
    {
      id: "first-task",
      name: "First Steps",
      description: "Complete your first task",
      icon: "🎯",
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: "streak-3",
      name: "On Fire",
      description: "Complete tasks 3 days in a row",
      icon: "🔥",
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: "points-50",
      name: "Point Collector",
      description: "Earn 50 points",
      icon: "⭐",
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: "tasks-10",
      name: "Task Master",
      description: "Complete 10 tasks",
      icon: "👑",
      unlocked: false,
      unlockedAt: null,
    },
  ];
};

// Method to find or create default user stats
userStatsSchema.statics.findOrCreateDefault = async function () {
  let stats = await this.findOne({ userId: "default" });

  if (!stats) {
    stats = await this.create({
      userId: "default",
      badges: this.getDefaultBadges(),
    });
  } else if (!stats.badges || stats.badges.length === 0) {
    // If badges array is empty, initialize it
    stats.badges = this.getDefaultBadges();
    await stats.save();
  }

  return stats;
};

const UserStats = mongoose.model("UserStats", userStatsSchema);

module.exports = UserStats;
