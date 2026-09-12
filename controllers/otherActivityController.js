const OtherActivity = require('../models/OtherActivity');

// @desc    Add a new other activity
// @route   POST /api/other-activities
// @access  Private
exports.addOtherActivity = async (req, res, next) => {
  try {
    const { category, customName, duration, date, notes } = req.body;

    const activity = await OtherActivity.create({
      user: req.user.id,
      category,
      customName: category === 'Custom' ? customName : '',
      duration: duration || 0,
      date: date || Date.now(),
      notes,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all other activities for logged in user
// @route   GET /api/other-activities
// @access  Private
exports.getOtherActivities = async (req, res, next) => {
  try {
    const activities = await OtherActivity.find({ user: req.user.id }).sort({
      date: -1,
      createdAt: -1,
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

// @desc    Delete an other activity
// @route   DELETE /api/other-activities/:id
// @access  Private
exports.deleteOtherActivity = async (req, res, next) => {
  try {
    const activity = await OtherActivity.findById(req.params.id);

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
// @desc    Update an other activity
// @route   PUT /api/other-activities/:id
// @access  Private
exports.updateOtherActivity = async (req, res, next) => {
  try {
    let activity = await OtherActivity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Make sure user owns activity
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this activity' });
    }

    const { category, customName, duration, date, notes } = req.body;

    activity.category = category || activity.category;
    activity.customName = category === 'Custom' ? customName : '';
    activity.duration = duration || activity.duration;
    activity.date = date ? new Date(date) : activity.date;
    activity.notes = notes !== undefined ? notes : activity.notes;

    await activity.save();

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
