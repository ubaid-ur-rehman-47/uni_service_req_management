const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
  assignDepartment,
  getRequestHistory
} = require('../controllers/requestController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createRequestValidation,
  updateRequestValidation,
  updateStatusValidation,
  assignDepartmentValidation
} = require('../validators/requestValidator');

// Public routes (protected by authentication)
router.post('/', protect, createRequestValidation, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id', protect, updateRequestValidation, updateRequest);
router.delete('/:id', protect, deleteRequest);

// Admin-only routes
router.put('/:id/status', protect, roleCheck('admin'), updateStatusValidation, updateRequestStatus);
router.put('/:id/assign', protect, roleCheck('admin'), assignDepartmentValidation, assignDepartment);

// Request history (accessible by students for their own, admins for all)
router.get('/:id/history', protect, getRequestHistory);

module.exports = router;
