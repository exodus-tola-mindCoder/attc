import LeaveApplication from '../models/LeaveApplication.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const submitLeaveApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // For students, use their own student profile
    let studentId = req.body.studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      studentId = student._id;
    }

    const leaveApplication = new LeaveApplication({
      ...req.body,
      studentId
    });

    await leaveApplication.save();
    await leaveApplication.populate('studentId', 'fullName studentId');

    logger.info(`Leave application submitted by student ${studentId}`);

    res.status(201).json({
      message: 'Leave application submitted successfully',
      application: leaveApplication
    });
  } catch (error) {
    logger.error('Error submitting leave application:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllLeaveApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // For students, only show their own applications
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        query.studentId = student._id;
      }
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Search functionality
    if (search) {
      const students = await Student.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const studentIds = students.map(s => s._id);
      query.studentId = { $in: studentIds };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await LeaveApplication.find(query)
      .populate('studentId', 'fullName studentId familyInfo.city')
      .populate('reviewer', 'username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveApplication.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    logger.error('Error fetching leave applications:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getLeaveApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await LeaveApplication.findById(id)
      .populate('studentId', 'fullName studentId familyInfo')
      .populate('reviewer', 'username email');

    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Students can only view their own applications
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || application.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(application);
  } catch (error) {
    logger.error('Error fetching leave application:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const reviewLeaveApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, reviewComments } = req.body;

    const application = await LeaveApplication.findByIdAndUpdate(
      id,
      {
        status,
        reviewComments,
        reviewer: req.user._id,
        reviewDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'fullName studentId');

    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    logger.info(`Leave application ${id} ${status} by user ${req.user._id}`);

    res.json({
      message: `Leave application ${status} successfully`,
      application
    });
  } catch (error) {
    logger.error('Error reviewing leave application:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateLeaveApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const application = await LeaveApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Students can only update their own pending applications
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || application.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (application.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot update non-pending application' });
      }
    }

    const updatedApplication = await LeaveApplication.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('studentId', 'fullName studentId');

    logger.info(`Leave application ${id} updated by user ${req.user._id}`);

    res.json({
      message: 'Leave application updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    logger.error('Error updating leave application:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteLeaveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await LeaveApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Students can only delete their own pending applications
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || application.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (application.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete non-pending application' });
      }
    }

    await LeaveApplication.findByIdAndDelete(id);

    logger.info(`Leave application ${id} deleted by user ${req.user._id}`);

    res.json({ message: 'Leave application deleted successfully' });
  } catch (error) {
    logger.error('Error deleting leave application:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getLeaveStatistics = async (req, res) => {
  try {
    const totalApplications = await LeaveApplication.countDocuments();

    const statusStats = await LeaveApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const typeStats = await LeaveApplication.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await LeaveApplication.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const averageDuration = await LeaveApplication.aggregate([
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    res.json({
      overview: {
        totalApplications,
        averageDuration: averageDuration[0]?.avgDuration || 0
      },
      statusStats,
      typeStats,
      monthlyStats
    });
  } catch (error) {
    logger.error('Error fetching leave statistics:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};