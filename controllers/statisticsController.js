const Expense = require('../models/Expense');
const Activity = require('../models/Activity');
const OtherActivity = require('../models/OtherActivity');
const Song = require('../models/Song');
const Reminder = require('../models/Reminder');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics for the current month
// @route   GET /api/statistics
// @access  Private
exports.getStatistics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    
    // Get start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Get end of the current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Total Expense for the month
    const expenseTotal = await Expense.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalExpense = expenseTotal.length > 0 ? expenseTotal[0].totalAmount : 0;

    // 2. Expense by Category (for Pie Chart)
    const expenseByCategoryRaw = await Expense.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { $group: { _id: '$category', value: { $sum: '$amount' } } }
    ]);
    
    const expenseByCategory = expenseByCategoryRaw.map(item => ({
      name: item._id,
      value: item.value
    }));

    // 3. Monthly Expense over time (Daily sum for Bar Chart)
    const monthlyExpenseRaw = await Expense.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: '$amount' } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyExpense = monthlyExpenseRaw.map(item => ({
      date: item._id,
      amount: item.amount
    }));

    // 4. Total Activities & Other Activities for the month
    const routinesCount = await Activity.countDocuments({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const otherActivitiesCount = await OtherActivity.countDocuments({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalActivities = routinesCount + otherActivitiesCount;

    // 5. Daily Activity (Count of activities per day for Line/Bar Chart)
    // We will combine counts from both collections using aggregation
    const routineAgg = await Activity.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } }
    ]);
    
    const otherAgg = await OtherActivity.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } }
    ]);

    // Merge routineAgg and otherAgg by date
    const activityMap = {};
    routineAgg.forEach(item => {
      activityMap[item._id] = (activityMap[item._id] || 0) + item.count;
    });
    otherAgg.forEach(item => {
      activityMap[item._id] = (activityMap[item._id] || 0) + item.count;
    });

    const dailyActivity = Object.keys(activityMap)
      .sort()
      .map(date => ({
        date,
        count: activityMap[date]
      }));

    // 6. Total Songs Added (All time or month? Prompt implies overall monthly wrapup but songs might be all time. We will do current month)
    const songsAdded = await Song.countDocuments({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 7. Completed Tasks (Reminders with isCompleted = true for the month)
    const completedTasks = await Reminder.countDocuments({
      user: userId,
      isCompleted: true,
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth } // using updatedAt assuming they were completed this month
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalExpense,
          totalActivities,
          songsAdded,
          completedTasks
        },
        charts: {
          expenseByCategory,
          monthlyExpense,
          dailyActivity
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
