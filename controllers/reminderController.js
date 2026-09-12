const Reminder = require('../models/Reminder');

// @desc    Add a new reminder
// @route   POST /api/reminders
// @access  Private
exports.addReminder = async (req, res, next) => {
  try {
    const { title, description, date, time, repeat, notificationOn } = req.body;

    const reminder = await Reminder.create({
      user: req.user.id,
      title,
      description,
      date,
      time,
      repeat: repeat || 'None',
      notificationOn: notificationOn !== undefined ? notificationOn : true,
    });

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reminders for logged in user
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res, next) => {
  try {
    // Sort by date and time (ascending so upcoming ones are first)
    const reminders = await Reminder.find({ user: req.user.id }).sort({
      date: 1,
      time: 1,
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle complete status
// @route   PUT /api/reminders/:id/complete
// @access  Private
exports.toggleComplete = async (req, res, next) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this reminder' });
    }

    reminder.isCompleted = !reminder.isCompleted;
    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this reminder' });
    }

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res, next) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this reminder' });
    }

    const { title, description, date, time, repeat, notificationOn } = req.body;

    reminder.title = title || reminder.title;
    reminder.description = description || reminder.description;
    reminder.date = date || reminder.date;
    reminder.time = time || reminder.time;
    reminder.repeat = repeat || reminder.repeat;
    reminder.notificationOn = notificationOn !== undefined ? notificationOn : reminder.notificationOn;

    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};
