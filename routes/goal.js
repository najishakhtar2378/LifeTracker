const express = require('express');
const {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getStreaks
} = require('../controllers/goalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/streaks').get(getStreaks);

router.route('/')
  .get(getGoals)
  .post(addGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;
