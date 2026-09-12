const mongoose = require('mongoose');

const otherActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Reading',
        'Walking',
        'Exercise',
        'Meditation',
        'Gaming',
        'Movie',
        'Travel',
        'Family Time',
        'Learning',
        'Other',
        'Custom'
      ],
      required: [true, 'Please select a category'],
    },
    customName: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: Number,
      default: 0, // in minutes
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OtherActivity', otherActivitySchema);
