const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const OtherActivity = require('../models/OtherActivity');
const mongoose = require('mongoose');

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new goal
// @route   POST /api/goals
// @access  Private
exports.addGoal = async (req, res, next) => {
  try {
    const { title, target, progress, unit, deadline } = req.body;

    const goal = await Goal.create({
      user: req.user.id,
      title,
      target: Number(target),
      progress: Number(progress) || 0,
      unit,
      deadline: new Date(deadline)
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, target, progress, unit, deadline } = req.body;

    goal.title = title || goal.title;
    if (target !== undefined) goal.target = Number(target);
    if (progress !== undefined) goal.progress = Number(progress);
    goal.unit = unit || goal.unit;
    goal.deadline = deadline ? new Date(deadline) : goal.deadline;

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate habit streaks from activities
// @route   GET /api/goals/streaks
// @access  Private
exports.getStreaks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch all activities and other activities
    const [activities, otherActivities] = await Promise.all([
      Activity.find({ user: userId }).select('title date'),
      OtherActivity.find({ user: userId }).select('title date')
    ]);

    const allLogs = [...activities, ...otherActivities];
    
    // Group dates by title
    const logsByTitle = {};
    
    allLogs.forEach(log => {
      // Normalize title (case insensitive, trim)
      const title = log.title.trim();
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      
      if (!logsByTitle[title]) {
        logsByTitle[title] = new Set();
      }
      logsByTitle[title].add(dateStr);
    });

    const activeStreaks = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Helper to calculate difference in days
    const diffDays = (date1Str, date2Str) => {
      const d1 = new Date(date1Str);
      const d2 = new Date(date2Str);
      return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
    };

    // Calculate streaks
    for (const [title, dateSet] of Object.entries(logsByTitle)) {
      const dates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a)); // Descending
      
      if (dates.length === 0) continue;

      const mostRecent = dates[0];
      
      // If the most recent is not today or yesterday, streak is broken (0)
      if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
        continue;
      }

      let currentStreak = 1;
      let lastDate = mostRecent;

      for (let i = 1; i < dates.length; i++) {
        const checkDate = dates[i];
        if (diffDays(lastDate, checkDate) === 1) {
          currentStreak++;
          lastDate = checkDate;
        } else {
          break; // Streak broken
        }
      }

      // We only care if streak is >= 2 to show it
      if (currentStreak >= 2) {
        activeStreaks.push({
          title,
          streak: currentStreak,
          lastLogged: mostRecent
        });
      }
    }

    // Sort by longest streak
    activeStreaks.sort((a, b) => b.streak - a.streak);

    res.status(200).json({
      success: true,
      data: activeStreaks
    });
  } catch (error) {
    next(error);
  }
};
