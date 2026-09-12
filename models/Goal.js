const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true
  },
  target: {
    type: Number,
    required: [true, 'Please set a target number']
  },
  progress: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit (e.g., ₹, books, kg)'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Please set a deadline']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);
