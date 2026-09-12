const Song = require('../models/Song');

// Helper to extract YouTube Video ID
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// @desc    Add a new song
// @route   POST /api/songs
// @access  Private
exports.addSong = async (req, res, next) => {
  try {
    const { title, artist, youtubeUrl, isFavourite } = req.body;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const song = await Song.create({
      user: req.user.id,
      title,
      artist,
      youtubeUrl,
      videoId,
      isFavourite: isFavourite || false,
    });

    res.status(201).json({
      success: true,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all songs for logged in user
// @route   GET /api/songs
// @access  Private
exports.getSongs = async (req, res, next) => {
  try {
    // Sort by favourite first, then by newest
    const songs = await Song.find({ user: req.user.id }).sort({
      isFavourite: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favourite status
// @route   PUT /api/songs/:id/favourite
// @access  Private
exports.toggleFavourite = async (req, res, next) => {
  try {
    let song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    // Make sure user owns song
    if (song.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this song' });
    }

    song.isFavourite = !song.isFavourite;
    await song.save();

    res.status(200).json({
      success: true,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private
exports.deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    // Make sure user owns song
    if (song.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this song' });
    }

    await song.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Private
exports.updateSong = async (req, res, next) => {
  try {
    let song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    // Make sure user owns song
    if (song.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this song' });
    }

    const { title, artist, youtubeUrl, isFavourite } = req.body;

    let videoId = song.videoId;
    if (youtubeUrl && youtubeUrl !== song.youtubeUrl) {
      videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
      }
    }

    song.title = title || song.title;
    song.artist = artist || song.artist;
    song.youtubeUrl = youtubeUrl || song.youtubeUrl;
    song.videoId = videoId;
    song.isFavourite = isFavourite !== undefined ? isFavourite : song.isFavourite;

    await song.save();

    res.status(200).json({
      success: true,
      data: song,
    });
  } catch (error) {
    next(error);
  }
};
