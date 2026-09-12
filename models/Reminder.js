const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a reminder title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: [true, 'Please add a time (HH:mm)'],
    },
    repeat: {
      type: String,
      enum: ['None', 'Daily', 'Weekly'],
      default: 'None',
    },
    notificationOn: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
