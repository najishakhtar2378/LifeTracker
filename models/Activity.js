const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add an activity title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      required: [true, 'Please select an activity type'],
      enum: [
        'Company Work',
        'Study',
        'Personal Work',
        'Outing',
        'Family',
        'Entertainment',
        'Other',
      ],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    startTime: {
      type: String,
      required: [true, 'Please add a start time (HH:mm)'],
    },
    endTime: {
      type: String,
      required: [true, 'Please add an end time (HH:mm)'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
