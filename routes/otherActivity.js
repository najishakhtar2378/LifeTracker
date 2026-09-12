const express = require('express');
const {
  addOtherActivity,
  getOtherActivities,
  deleteOtherActivity,
  updateOtherActivity,
} = require('../controllers/otherActivityController');
const auth = require('../middleware/auth');

const router = express.Router();

// All other-activity routes must be protected
router.use(auth);

router.route('/')
  .post(addOtherActivity)
  .get(getOtherActivities);

router.route('/:id')
  .put(updateOtherActivity)
  .delete(deleteOtherActivity);

module.exports = router;
