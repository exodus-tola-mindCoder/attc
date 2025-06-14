import Feedback from '../models/Feedback.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const feedbackData = {
      ...req.body,
      senderId: req.body.isAnonymous ? null : req.user._id
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    logger.info(`Feedback submitted: ${feedback.type} - ${feedback.category} by ${req.body.isAnonymous ? 'anonymous' : req.user._id}`);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        _id: feedback._id,
        type: feedback.type,
        category: feedback.category,
        subject: feedback.subject,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      category,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.senderId = req.user._id;
    } else if (req.user.role === 'clinic') {
      query.category = 'clinic';
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { relatedTo: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await Feedback.find(query)
      .populate('senderId', 'username email role')
      .populate('assignedTo', 'username')
      .populate('response.respondedBy', 'username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('senderId', 'username email role')
      .populate('assignedTo', 'username email')
      .populate('response.respondedBy', 'username')
      .populate('resolvedBy', 'username');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Students can only view their own feedback
    if (req.user.role === 'student' &&
      feedback.senderId &&
      feedback.senderId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(feedback);
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;

    const updateData = { status };

    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user._id;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('senderId', 'username email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    logger.info(`Feedback ${id} status updated to ${status} by user ${req.user._id}`);

    res.json({
      message: 'Feedback status updated successfully',
      feedback
    });
  } catch (error) {
    logger.error('Error updating feedback status:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const respondToFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { message } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        'response.message': message,
        'response.respondedBy': req.user._id,
        'response.respondedAt': new Date(),
        status: 'in_review'
      },
      { new: true, runValidators: true }
    ).populate('senderId', 'username email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    logger.info(`Response added to feedback ${id} by user ${req.user._id}`);

    res.json({
      message: 'Response added successfully',
      feedback
    });
  } catch (error) {
    logger.error('Error responding to feedback:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Students can only delete their own feedback
    if (req.user.role === 'student' &&
      feedback.senderId &&
      feedback.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Feedback.findByIdAndDelete(id);

    logger.info(`Feedback ${id} deleted by user ${req.user._id}`);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    logger.error('Error deleting feedback:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFeedbackStatistics = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();

    const statusStats = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const typeStats = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryStats = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Feedback.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await Feedback.aggregate([
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

    const averageRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      overview: {
        totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        pendingCount: await Feedback.countDocuments({ status: 'new' }),
        resolvedCount: await Feedback.countDocuments({ status: 'resolved' })
      },
      statusStats,
      typeStats,
      categoryStats,
      priorityStats,
      monthlyStats
    });
  } catch (error) {
    logger.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};