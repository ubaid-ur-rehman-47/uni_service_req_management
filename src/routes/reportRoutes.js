const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getDepartmentStats,
  getCategoryStats,
  getPriorityStats,
  getComprehensiveReport
} = require('../controllers/reportController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All report routes are admin-only
router.get('/overview', protect, roleCheck('admin'), getOverviewStats);
router.get('/by-department', protect, roleCheck('admin'), getDepartmentStats);
router.get('/by-category', protect, roleCheck('admin'), getCategoryStats);
router.get('/by-priority', protect, roleCheck('admin'), getPriorityStats);
router.get('/comprehensive', protect, roleCheck('admin'), getComprehensiveReport);

module.exports = router;
