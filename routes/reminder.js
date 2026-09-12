const express = require('express');
const {
  addReminder,
  getReminders,
  toggleComplete,
  deleteReminder,
  updateReminder,
} = require('../controllers/reminderController');
const auth = require('../middleware/auth');

const router = express.Router();

// All reminder routes must be protected
router.use(auth);

router.route('/')
  .post(addReminder)
  .get(getReminders);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

router.route('/:id/complete')
  .put(toggleComplete);

module.exports = router;
