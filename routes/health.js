const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'LifeTrack API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
