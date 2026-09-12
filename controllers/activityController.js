const Activity = require('../models/Activity');

// @desc    Add a new activity
// @route   POST /api/activities
// @access  Private
exports.addActivity = async (req, res, next) => {
  try {
    const { title, description, type, date, startTime, endTime } = req.body;

    const activity = await Activity.create({
      user: req.user.id,
      title,
      description,
      type,
      date: date ? new Date(date) : Date.now(),
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activities for logged in user
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    // Sort by date (newest first) and then startTime (latest first)
    const activities = await Activity.find({ user: req.user.id }).sort({
      date: -1,
      startTime: -1,
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Make sure user owns activity
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this activity' });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Make sure user owns activity
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this activity' });
    }

    const { title, description, type, date, startTime, endTime } = req.body;

    activity.title = title || activity.title;
    activity.description = description !== undefined ? description : activity.description;
    activity.type = type || activity.type;
    activity.date = date ? new Date(date) : activity.date;
    activity.startTime = startTime || activity.startTime;
    activity.endTime = endTime || activity.endTime;

    await activity.save();

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
