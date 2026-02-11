const Request = require('../models/Request');

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (Student/Admin)
const createRequest = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const request = await Request.create({
      studentId: req.user._id,
      title,
      description,
      category,
      priority: priority || 'Medium'
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('studentId', 'name email studentId');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private (Students see their own, Admins see all)
const getRequests = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own requests
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    // Filtering options
    const { status, category, priority, department } = req.query;

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.assignedDepartment = department;

    const requests = await Request.find(query)
      .populate('studentId', 'name email studentId')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Private (Students see own, Admins see all)
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('assignedBy', 'name email')
      .populate('statusHistory.updatedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Students can only view their own requests
    if (req.user.role === 'student' && request.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Private (Student - owner only)
const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the student who created the request can update it
    if (request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Students can only update if status is Pending
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot update request after it has been processed' });
    }

    const { title, description, category, priority } = req.body;

    if (title) request.title = title;
    if (description) request.description = description;
    if (category) request.category = category;
    if (priority) request.priority = priority;

    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('studentId', 'name email studentId');

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private (Student - owner only)
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the student who created the request can delete it
    if (request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    // Students can only delete if status is Pending
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot delete request after it has been processed' });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status (Admin only)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;

    // Add to status history
    request.statusHistory.push({
      status,
      updatedBy: req.user._id,
      comment: comment || `Status updated to ${status}`,
      updatedAt: new Date()
    });

    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('studentId', 'name email studentId')
      .populate('assignedBy', 'name email')
      .populate('statusHistory.updatedBy', 'name email');

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign request to department (Admin only)
// @route   PUT /api/requests/:id/assign
// @access  Private/Admin
const assignDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.assignedDepartment = department;
    request.assignedBy = req.user._id;

    // Add to status history
    request.statusHistory.push({
      status: request.status,
      updatedBy: req.user._id,
      comment: `Assigned to ${department} department`,
      updatedAt: new Date()
    });

    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('studentId', 'name email studentId')
      .populate('assignedBy', 'name email');

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get request status history
// @route   GET /api/requests/:id/history
// @access  Private
const getRequestHistory = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('statusHistory.updatedBy', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Students can only view their own request history
    if (req.user.role === 'student' && request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this request history' });
    }

    res.json({
      requestId: request._id,
      title: request.title,
      statusHistory: request.statusHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
  assignDepartment,
  getRequestHistory
};
