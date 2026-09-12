const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a song title'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Please add an artist'],
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'Please add a YouTube URL'],
      match: [
        /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/,
        'Please enter a valid YouTube URL',
      ],
    },
    videoId: {
      type: String,
      required: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Song', songSchema);
