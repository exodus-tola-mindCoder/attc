import CourseRegistration from '../models/CourseRegistration.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Register for courses (Student)
export const registerForCourses = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseIds, semesterId } = req.body;

    // Get student profile
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Verify semester exists and registration is open
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    if (!semester.isRegistrationCurrentlyOpen) {
      return res.status(400).json({
        success: false,
        message: 'Course registration is not currently open for this semester'
      });
    }

    // Verify all courses exist and belong to the semester
    const courses = await Course.find({
      _id: { $in: courseIds },
      semesterId: semesterId
    });

    if (courses.length !== courseIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more courses not found or not available for this semester'
      });
    }

    // Check for existing registrations
    const existingRegistrations = await CourseRegistration.find({
      studentId: student._id,
      courseId: { $in: courseIds },
      semesterId: semesterId,
      status: { $in: ['registered', 'approved', 'pending'] }
    });

    if (existingRegistrations.length > 0) {
      const existingCourseIds = existingRegistrations.map(reg => reg.courseId.toString());
      const duplicateCourses = courses.filter(course =>
        existingCourseIds.includes(course._id.toString())
      );

      return res.status(400).json({
        success: false,
        message: `Already registered for: ${duplicateCourses.map(c => c.courseName).join(', ')}`
      });
    }

    // Create registrations
    const registrations = courseIds.map(courseId => ({
      studentId: student._id,
      courseId,
      semesterId,
      status: 'registered',
      registrationDate: new Date()
    }));

    const createdRegistrations = await CourseRegistration.insertMany(registrations);

    // Populate the created registrations
    const populatedRegistrations = await CourseRegistration.find({
      _id: { $in: createdRegistrations.map(reg => reg._id) }
    })
      .populate('courseId', 'courseName courseCode credits')
      .populate('semesterId', 'name academicYear');

    res.status(201).json({
      success: true,
      message: `Successfully registered for ${courseIds.length} course(s)`,
      data: populatedRegistrations
    });
  } catch (error) {
    console.error('Error registering for courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for courses'
    });
  }
};

// Get student's course registrations
export const getStudentRegistrations = async (req, res) => {
  try {
    const { semesterId, status } = req.query;

    // Get student profile
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    let query = { studentId: student._id };

    if (semesterId) query.semesterId = semesterId;
    if (status) query.status = status;

    const registrations = await CourseRegistration.find(query)
      .populate('courseId', 'courseName courseCode credits department instructor')
      .populate('semesterId', 'name academicYear isActive')
      .sort({ registrationDate: -1 });

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

// Drop a course (Student)
export const dropCourse = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get student profile
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const registration = await CourseRegistration.findOne({
      _id: registrationId,
      studentId: student._id
    }).populate('semesterId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Course registration not found'
      });
    }

    // Check if registration can be dropped (within registration period)
    if (!registration.semesterId.isRegistrationCurrentlyOpen) {
      return res.status(400).json({
        success: false,
        message: 'Course drop period has ended for this semester'
      });
    }

    if (registration.status === 'dropped') {
      return res.status(400).json({
        success: false,
        message: 'Course already dropped'
      });
    }

    registration.status = 'dropped';
    registration.dropDate = new Date();
    await registration.save();

    await registration.populate('courseId', 'courseName courseCode');

    res.json({
      success: true,
      message: 'Course dropped successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error dropping course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to drop course'
    });
  }
};

// Get all course registrations (Admin)
export const getAllRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      semesterId,
      status,
      search,
      courseId,
      department
    } = req.query;

    let query = {};

    if (semesterId) query.semesterId = semesterId;
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'semesters',
          localField: 'semesterId',
          foreignField: '_id',
          as: 'semester'
        }
      },
      { $unwind: '$semester' }
    ];

    // Add search filter
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'student.fullName': { $regex: search, $options: 'i' } },
            { 'student.studentId': { $regex: search, $options: 'i' } },
            { 'course.courseName': { $regex: search, $options: 'i' } },
            { 'course.courseCode': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add department filter
    if (department) {
      aggregationPipeline.push({
        $match: { 'course.department': department }
      });
    }

    // Add sorting, skip, and limit
    aggregationPipeline.push(
      { $sort: { registrationDate: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const registrations = await CourseRegistration.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalPipeline = [...aggregationPipeline.slice(0, -2)]; // Remove skip and limit
    totalPipeline.push({ $count: 'total' });
    const totalResult = await CourseRegistration.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

// Update registration status (Admin)
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status, notes } = req.body;

    const registration = await CourseRegistration.findByIdAndUpdate(
      registrationId,
      {
        status,
        notes,
        approvedBy: req.user.id,
        approvalDate: new Date()
      },
      { new: true }
    )
      .populate('studentId', 'fullName studentId')
      .populate('courseId', 'courseName courseCode')
      .populate('semesterId', 'name academicYear');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Course registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status'
    });
  }
};

// Add grade to registration (Admin)
export const addGrade = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { grade, notes } = req.body;

    if (grade < 0 || grade > 100) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be between 0 and 100'
      });
    }

    const registration = await CourseRegistration.findByIdAndUpdate(
      registrationId,
      { grade, notes },
      { new: true }
    )
      .populate('studentId', 'fullName studentId')
      .populate('courseId', 'courseName courseCode credits');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Course registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade added successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error adding grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add grade'
    });
  }
};

// Get registration statistics
export const getRegistrationStatistics = async (req, res) => {
  try {
    const { semesterId } = req.query;

    let matchStage = {};
    if (semesterId) matchStage.semesterId = mongoose.Types.ObjectId(semesterId);

    // Registration status distribution
    const statusStats = await CourseRegistration.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Registrations by course
    const courseStats = await CourseRegistration.aggregate([
      { $match: matchStage },
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
      { $limit: 10 }
    ]);

    // Total unique students
    const uniqueStudents = await CourseRegistration.distinct('studentId', matchStage);

    // Average grade if grades are available
    const gradeStats = await CourseRegistration.aggregate([
      {
        $match: {
          ...matchStage,
          grade: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageGrade: { $avg: '$grade' },
          totalGraded: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        courseStats,
        totalStudents: uniqueStudents.length,
        gradeStats: gradeStats[0] || { averageGrade: 0, totalGraded: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching registration statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration statistics'
    });
  }
};

// Get available courses for registration
export const getAvailableCourses = async (req, res) => {
  try {
    const { semesterId, department, search } = req.query;

    // Get student profile
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Build query for courses
    let courseQuery = {};
    if (semesterId) courseQuery.semesterId = semesterId;
    if (department) courseQuery.department = department;
    if (search) {
      courseQuery.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(courseQuery)
      .populate('semesterId', 'name academicYear isRegistrationCurrentlyOpen')
      .sort({ courseCode: 1 });

    // Get student's existing registrations for this semester
    const existingRegistrations = await CourseRegistration.find({
      studentId: student._id,
      semesterId: semesterId,
      status: { $in: ['registered', 'approved', 'pending'] }
    }).select('courseId');

    const registeredCourseIds = existingRegistrations.map(reg => reg.courseId.toString());

    // Mark courses as already registered
    const coursesWithStatus = courses.map(course => ({
      ...course.toObject(),
      isRegistered: registeredCourseIds.includes(course._id.toString())
    }));

    res.json({
      success: true,
      data: coursesWithStatus
    });
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available courses'
    });
  }
};