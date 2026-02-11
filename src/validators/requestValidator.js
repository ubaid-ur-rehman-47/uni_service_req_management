const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Create request validation rules
const createRequestValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Fee', 'Hostel', 'IT', 'Academic', 'Other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  validate
];

// Update request validation rules
const updateRequestValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['Fee', 'Hostel', 'IT', 'Academic', 'Other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  validate
];

// Update status validation rules
const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'InProgress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate
];

// Assign department validation rules
const assignDepartmentValidation = [
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department must be between 2 and 100 characters'),
  validate
];

module.exports = {
  createRequestValidation,
  updateRequestValidation,
  updateStatusValidation,
  assignDepartmentValidation
};
