const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date: date ? new Date(date) : Date.now(),
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this expense' });
    }

    const { amount, category, description, date } = req.body;
    
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.date = date ? new Date(date) : expense.date;

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense summary (Today, Week, Month, Year)
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // Start of Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of This Week (Assuming Sunday is first day)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // Start of This Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of This Year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aggregation pipeline
    const summary = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalToday: {
            $sum: { $cond: [{ $gte: ['$date', startOfToday] }, '$amount', 0] },
          },
          totalWeek: {
            $sum: { $cond: [{ $gte: ['$date', startOfWeek] }, '$amount', 0] },
          },
          totalMonth: {
            $sum: { $cond: [{ $gte: ['$date', startOfMonth] }, '$amount', 0] },
          },
          totalYear: {
            $sum: { $cond: [{ $gte: ['$date', startOfYear] }, '$amount', 0] },
          },
          totalAllTime: { $sum: '$amount' },
        },
      },
    ]);

    if (summary.length === 0) {
      return res.status(200).json({
        success: true,
        data: { totalToday: 0, totalWeek: 0, totalMonth: 0, totalYear: 0, totalAllTime: 0 },
      });
    }

    res.status(200).json({
      success: true,
      data: summary[0],
    });
  } catch (error) {
    next(error);
  }
};
