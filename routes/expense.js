const express = require('express');
const {
  addExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
  updateExpense,
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

// All expense routes must be protected
router.use(auth);

router.route('/')
  .post(addExpense)
  .get(getExpenses);

router.route('/summary')
  .get(getExpenseSummary);

router.route('/:id')
  .delete(deleteExpense)
  .put(updateExpense);

module.exports = router;
