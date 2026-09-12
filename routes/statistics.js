const express = require('express');
const { getStatistics } = require('../controllers/statisticsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Route must be protected
router.use(auth);

router.route('/')
  .get(getStatistics);

module.exports = router;
