import Semester from '../models/Semester.js';
import Course from '../models/Course.js';
import CourseRegistration from '../models/CourseRegistration.js';
import { validationResult } from 'express-validator';

// Get all semesters
export const getSemesters = async (req, res) => {
  try {
    const { page = 1, limit = 10, academicYear, isActive } = req.query;

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const semesters = await Semester.find(query)
      .populate('createdBy', 'username')
      .sort({ academicYear: -1, startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Semester.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        semesters,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch semesters'
    });
  }
};

// Get current active semester
export const getActiveSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({ isActive: true })
      .populate('createdBy', 'username');

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'No active semester found'
      });
    }

    res.json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error('Error fetching active semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active semester'
    });
  }
};

// Create new semester
export const createSemester = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      academicYear,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      isActive,
      isRegistrationOpen,
      description
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (regStart >= regEnd) {
      return res.status(400).json({
        success: false,
        message: 'Registration end date must be after registration start date'
      });
    }

    if (regEnd > end) {
      return res.status(400).json({
        success: false,
        message: 'Registration end date cannot be after semester end date'
      });
    }

    const semester = new Semester({
      name,
      academicYear,
      startDate: start,
      endDate: end,
      registrationStartDate: regStart,
      registrationEndDate: regEnd,
      isActive: isActive || false,
      isRegistrationOpen: isRegistrationOpen || false,
      description,
      createdBy: req.user.id
    });

    await semester.save();
    await semester.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Semester created successfully',
      data: semester
    });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create semester'
    });
  }
};

// Update semester
export const updateSemester = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    const semester = await Semester.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    res.json({
      success: true,
      message: 'Semester updated successfully',
      data: semester
    });
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update semester'
    });
  }
};

// Delete semester
export const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if semester has any course registrations
    const registrationCount = await CourseRegistration.countDocuments({ semesterId: id });

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete semester with existing course registrations'
      });
    }

    const semester = await Semester.findByIdAndDelete(id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    res.json({
      success: true,
      message: 'Semester deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete semester'
    });
  }
};

// Get semester statistics
export const getSemesterStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    // Get course count for this semester
    const courseCount = await Course.countDocuments({ semesterId: id });

    // Get registration statistics
    const registrationStats = await CourseRegistration.aggregate([
      { $match: { semesterId: mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total unique students registered
    const uniqueStudents = await CourseRegistration.distinct('studentId', {
      semesterId: id,
      status: { $in: ['registered', 'approved'] }
    });

    // Get most popular courses
    const popularCourses = await CourseRegistration.aggregate([
      {
        $match: {
          semesterId: mongoose.Types.ObjectId(id),
          status: { $in: ['registered', 'approved'] }
        }
      },
      {
        $group: {
          _id: '$courseId',
          registrationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      { $sort: { registrationCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        semester,
        courseCount,
        totalStudents: uniqueStudents.length,
        registrationStats,
        popularCourses
      }
    });
  } catch (error) {
    console.error('Error fetching semester statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch semester statistics'
    });
  }
};

// Set active semester
export const setActiveSemester = async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate all semesters first
    await Semester.updateMany({}, { isActive: false });

    // Activate the selected semester
    const semester = await Semester.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).populate('createdBy', 'username');

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    res.json({
      success: true,
      message: 'Active semester updated successfully',
      data: semester
    });
  } catch (error) {
    console.error('Error setting active semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set active semester'
    });
  }
};