const Request = require('../models/Request');

// @desc    Get overview statistics
// @route   GET /api/reports/overview
// @access  Private/Admin
const getOverviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Request.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total count
    const totalRequests = await Request.countDocuments(matchQuery);

    // Format the stats
    const formattedStats = {
      total: totalRequests,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (status === 'pending') formattedStats.pending = stat.count;
      else if (status === 'inprogress') formattedStats.inProgress = stat.count;
      else if (status === 'resolved') formattedStats.resolved = stat.count;
      else if (status === 'rejected') formattedStats.rejected = stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department-wise distribution
// @route   GET /api/reports/by-department
// @access  Private/Admin
const getDepartmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = { assignedDepartment: { $ne: '' } };

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const departmentStats = await Request.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const formattedStats = departmentStats.map(dept => ({
      department: dept._id,
      total: dept.total,
      pending: dept.pending,
      inProgress: dept.inProgress,
      resolved: dept.resolved,
      rejected: dept.rejected
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category-wise breakdown
// @route   GET /api/reports/by-category
// @access  Private/Admin
const getCategoryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const categoryStats = await Request.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const formattedStats = categoryStats.map(cat => ({
      category: cat._id,
      total: cat.total,
      pending: cat.pending,
      inProgress: cat.inProgress,
      resolved: cat.resolved,
      rejected: cat.rejected
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get priority analysis
// @route   GET /api/reports/by-priority
// @access  Private/Admin
const getPriorityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const priorityStats = await Request.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    // Sort by priority order: High, Medium, Low
    const priorityOrder = ['High', 'Medium', 'Low'];
    const formattedStats = priorityStats
      .sort((a, b) => priorityOrder.indexOf(a._id) - priorityOrder.indexOf(b._id))
      .map(priority => ({
        priority: priority._id,
        total: priority.total,
        pending: priority.pending,
        inProgress: priority.inProgress,
        resolved: priority.resolved,
        rejected: priority.rejected
      }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive report with all stats
// @route   GET /api/reports/comprehensive
// @access  Private/Admin
const getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all stats in parallel
    const [overview, byDepartment, byCategory, byPriority] = await Promise.all([
      getOverviewData(startDate, endDate),
      getDepartmentData(startDate, endDate),
      getCategoryData(startDate, endDate),
      getPriorityData(startDate, endDate)
    ]);

    res.json({
      overview,
      byDepartment,
      byCategory,
      byPriority,
      generatedAt: new Date(),
      dateRange: {
        start: startDate || 'All time',
        end: endDate || 'Present'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for comprehensive report
async function getOverviewData(startDate, endDate) {
  let matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await Request.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalRequests = await Request.countDocuments(matchQuery);

  const formattedStats = {
    total: totalRequests,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    const status = stat._id.toLowerCase();
    if (status === 'pending') formattedStats.pending = stat.count;
    else if (status === 'inprogress') formattedStats.inProgress = stat.count;
    else if (status === 'resolved') formattedStats.resolved = stat.count;
    else if (status === 'rejected') formattedStats.rejected = stat.count;
  });

  return formattedStats;
}

async function getDepartmentData(startDate, endDate) {
  let matchQuery = { assignedDepartment: { $ne: '' } };
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await Request.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$assignedDepartment',
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return stats.map(dept => ({
    department: dept._id,
    total: dept.total
  }));
}

async function getCategoryData(startDate, endDate) {
  let matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await Request.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return stats.map(cat => ({
    category: cat._id,
    total: cat.total
  }));
}

async function getPriorityData(startDate, endDate) {
  let matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await Request.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$priority',
        total: { $sum: 1 }
      }
    }
  ]);

  const priorityOrder = ['High', 'Medium', 'Low'];
  return stats
    .sort((a, b) => priorityOrder.indexOf(a._id) - priorityOrder.indexOf(b._id))
    .map(priority => ({
      priority: priority._id,
      total: priority.total
    }));
}

module.exports = {
  getOverviewStats,
  getDepartmentStats,
  getCategoryStats,
  getPriorityStats,
  getComprehensiveReport
};
