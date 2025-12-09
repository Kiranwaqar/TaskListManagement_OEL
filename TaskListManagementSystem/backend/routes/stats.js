/**
 * User Stats Routes
 * Handles all operations for user statistics (badges, streaks, points)
 */

const express = require("express");
const router = express.Router();
const UserStats = require("../models/UserStats");

/**
 * @route   GET /api/stats
 * @desc    Get user statistics (badges, streaks, points)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const stats = await UserStats.findOrCreateDefault();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/stats
 * @desc    Create or initialize user statistics
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    // Check if stats already exist
    let stats = await UserStats.findOne({ userId: "default" });
    
    if (stats) {
      return res.json({
        success: true,
        data: stats,
        message: "Stats already exist",
      });
    }

    // Create new stats with default badges
    stats = await UserStats.create({
      userId: "default",
      badges: UserStats.getDefaultBadges(),
    });

    res.status(201).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/stats
 * @desc    Update user statistics (points, streaks, badges)
 * @access  Public
 */
router.patch("/", async (req, res) => {
  try {
    const updates = req.body;
    const stats = await UserStats.findOrCreateDefault();

    // Update fields if provided
    if (updates.totalPoints !== undefined) {
      stats.totalPoints = updates.totalPoints;
    }
    if (updates.currentStreak !== undefined) {
      stats.currentStreak = updates.currentStreak;
      // Update longest streak if current is longer
      if (updates.currentStreak > stats.longestStreak) {
        stats.longestStreak = updates.currentStreak;
      }
    }
    if (updates.lastCompletedDate !== undefined) {
      stats.lastCompletedDate = updates.lastCompletedDate;
    }
    if (updates.tasksCompleted !== undefined) {
      stats.tasksCompleted = updates.tasksCompleted;
    }
    if (updates.totalTasks !== undefined) {
      stats.totalTasks = updates.totalTasks;
    }

    // Update badges if provided
    if (updates.badges && Array.isArray(updates.badges)) {
      stats.badges = updates.badges;
    }

    // Update specific badge
    if (updates.badge) {
      const { badgeId, unlocked, unlockedAt } = updates.badge;
      const badgeIndex = stats.badges.findIndex((b) => b.id === badgeId);
      
      if (badgeIndex !== -1) {
        stats.badges[badgeIndex].unlocked = unlocked !== undefined ? unlocked : stats.badges[badgeIndex].unlocked;
        stats.badges[badgeIndex].unlockedAt = unlockedAt !== undefined ? unlockedAt : stats.badges[badgeIndex].unlockedAt;
      }
    }

    await stats.save();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/stats/badges
 * @desc    Update all badges at once
 * @access  Public
 */
router.put("/badges", async (req, res) => {
  try {
    const { badges } = req.body;
    
    if (!Array.isArray(badges)) {
      return res.status(400).json({
        success: false,
        error: "Badges must be an array",
      });
    }

    const stats = await UserStats.findOrCreateDefault();
    stats.badges = badges;
    await stats.save();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/stats/badge/:badgeId
 * @desc    Unlock a specific badge
 * @access  Public
 */
router.patch("/badge/:badgeId", async (req, res) => {
  try {
    const { badgeId } = req.params;
    const stats = await UserStats.findOrCreateDefault();
    
    const badge = stats.badges.find((b) => b.id === badgeId);
    
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: "Badge not found",
      });
    }

    badge.unlocked = true;
    badge.unlockedAt = new Date();
    
    await stats.save();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

