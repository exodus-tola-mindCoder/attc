import Instructor from '../models/Instructor.js'
import Course from '../models/Course.js';

import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const createInstructor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      return res.status(400).json({
        message: 'Server error in the create Instructor controller',
        errors: errors.array()
      });
    }

    const instructor = new Instructor(req.body);
    await instructor.save();

    logger.info(`Instructor created: ${instructor.name} by user ${req.user._id}`)

    res.status(201).json({
      message: 'Instructor created successfully',
      instructor
    });
  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Instructor with this email already exists'
      });
    }
    logger.error('Error creating instructor:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getAllInstructors = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      search,
      department,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }


    // Filter by department
    if (department && department !== 'All') {
      query.department = { $regex: department, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const instructors = await Instructor.find(query)
      .populate('coursesTaught', 'courseName courseCode')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Instructor.countDocuments(query);

    res.json({
      instructors,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });

  } catch (error) {
    logger.error('Error fetching instructors:', error);
    res.status(500).json({
      message: 'Server error in the getAllInstructors controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id)
      .populate('coursesTaught', 'courseName courseCode description credits semester');

    if (!instructor || !instructor.isActive) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json(instructor);

  } catch (error) {
    logger.error('Error fetching instructor:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const instructor = await Instructor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('coursesTaught', 'courseName courseCode');
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    logger.info(`Instructor updated: ${instructor.name} by user ${req.user._id}`);

    res.json({
      message: 'Instructor updated successfully',
      instructor
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Instructor with this email already exists'
      });
    }
    logger.error('Error updating instructor:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    logger.info(`Instructor deleted: ${instructor.name} by user ${req.user._id}`);

    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {

    logger.error('Error deleting instructor:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
};


export const assignCourse = async (req, res) => {
  try {

    const { instructorId, courseId } = req.body;


    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (instructor.coursesTaught.includes(courseId)) {
      return res.status(400).json({ message: 'Course already assigned to instructor' });
    }

    instructor.coursesTaught.push(courseId);
    await instructor.save();


    logger.info(`Course ${courseId} assigned to instructor ${instructorId} by user ${req.user._id}`);
    res.json({ message: 'Course assigned successfully' });
  } catch (error) {

    logger.error('Error assigning course:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const unassignCourse = async (req, res) => {
  try {
    const { instructorId, courseId } = req.body;


    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    instructor.coursesTaught = instructor.coursesTaught.filter(
      id => id.toString() !== courseId
    );
    await instructor.save();

    logger.info(`Course ${courseId} unassigned from instructor ${instructorId} by user ${req.user._id}`);

    res.json({ message: 'Course unassigned successfully' });

  } catch (error) {
    logger.error('Error unassigning course:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
};

