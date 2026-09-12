const express = require('express');
const {
  addSong,
  getSongs,
  toggleFavourite,
  deleteSong,
  updateSong,
} = require('../controllers/songController');
const auth = require('../middleware/auth');

const router = express.Router();

// All song routes must be protected
router.use(auth);

router.route('/')
  .post(addSong)
  .get(getSongs);

router.route('/:id')
  .put(updateSong)
  .delete(deleteSong);

router.route('/:id/favourite')
  .put(toggleFavourite);

module.exports = router;
