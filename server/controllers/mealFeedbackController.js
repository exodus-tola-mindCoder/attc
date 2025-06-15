import MealFeedback from '../models/MealFeedback.js';
import MealSchedule from '../models/MealSchedule.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';

// Submit meal feedback
export const submitMealFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mealScheduleId, mealType, date, rating, comment, categories, suggestions, isAnonymous } = req.body;

    // Get student profile
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Verify meal schedule exists
    const mealSchedule = await MealSchedule.findById(mealScheduleId);
    if (!mealSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Meal schedule not found'
      });
    }

    // Check if feedback already exists for this student, date, and meal type
    const existingFeedback = await MealFeedback.findOne({
      studentId: student._id,
      date: new Date(date),
      mealType
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this meal'
      });
    }

    const feedback = new MealFeedback({
      studentId: student._id,
      mealScheduleId,
      mealType,
      date: new Date(date),
      rating,
      comment,
      categories,
      suggestions,
      isAnonymous
    });

    await feedback.save();
    await feedback.populate('studentId', 'fullName studentId');
    await feedback.populate('mealScheduleId');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting meal feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// Get meal feedback (admin only)
export const getMealFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, mealType, date, startDate, endDate, rating } = req.query;

    let query = {};

    if (mealType) {
      query.mealType = mealType;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedback = await MealFeedback.find(query)
      .populate('studentId', 'fullName studentId')
      .populate('mealScheduleId', 'items description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MealFeedback.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching meal feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal feedback'
    });
  }
};

// Get feedback statistics
export const getFeedbackStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Overall statistics
    const totalFeedback = await MealFeedback.countDocuments(dateFilter);

    const averageRating = await MealFeedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Rating distribution
    const ratingDistribution = await MealFeedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Feedback by meal type
    const feedbackByMealType = await MealFeedback.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Category ratings (if available)
    const categoryRatings = await MealFeedback.aggregate([
      { $match: { ...dateFilter, 'categories.taste': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgTaste: { $avg: '$categories.taste' },
          avgQuality: { $avg: '$categories.quality' },
          avgPortion: { $avg: '$categories.portion' },
          avgService: { $avg: '$categories.service' }
        }
      }
    ]);

    // Recent feedback trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrends = await MealFeedback.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        ratingDistribution,
        feedbackByMealType,
        categoryRatings: categoryRatings[0] || {},
        recentTrends
      }
    });
  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
};

// Get student's own feedback
export const getMyFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedback = await MealFeedback.find({ studentId: student._id })
      .populate('mealScheduleId', 'items description mealType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MealFeedback.countDocuments({ studentId: student._id });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your feedback'
    });
  }
};

// Update feedback (student can update their own)
export const updateMealFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, categories, suggestions } = req.body;

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const feedback = await MealFeedback.findOne({
      _id: id,
      studentId: student._id
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or you do not have permission to update it'
      });
    }

    // Only allow updates within 24 hours of submission
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    if (feedback.createdAt < twentyFourHoursAgo) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be updated within 24 hours of submission'
      });
    }

    feedback.rating = rating;
    feedback.comment = comment;
    feedback.categories = categories;
    feedback.suggestions = suggestions;

    await feedback.save();
    await feedback.populate('mealScheduleId', 'items description');

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating meal feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
};

// Delete feedback (admin only)
export const deleteMealFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await MealFeedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
};