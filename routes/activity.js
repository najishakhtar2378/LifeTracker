const express = require('express');
const {
  addActivity,
  getActivities,
  deleteActivity,
  updateActivity,
} = require('../controllers/activityController');
const auth = require('../middleware/auth');

const router = express.Router();

// All activity routes must be protected
router.use(auth);

router.route('/')
  .post(addActivity)
  .get(getActivities);

router.route('/:id')
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
