import Student from '../models/Student.js';
import User from '../models/User.js';

export const registerStudent = async (req, res) => {

  try {
    const {
      fullName,
      backgroundEducation,
      familyInfo,
      healthInfo,
    } = req.body;
    
    // Check if the user already has a student profile
    const existingStudent = await Student.findOne({ userId: req.user._id });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student profile already exists' });
    }
    // Generate student ID
    
    const studentCount = await Student.countDocuments();
    const studentId = `STU${(studentCount + 1).toString().padStart(6, '0')}`;

    // create student profile

    const student = new Student({
      userId: req.user._id, // link to the authenticated user
      fullName,
      studentId,
      backgroundEducation,
      familyInfo,
      healthInfo,
    });

    await student.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error occurred in registering student',
      error: error.message,
    });
  }
};


export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, disability } = req.query;


    // Parse page and limit as integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    let query = {};




    // Add search filters
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query['familyInfo.city'] = { $regex: city, $options: 'i' };
    }

    if (disability && disability !== 'None') {
      query['healthInfo.disabilities'] = { $ne: 'None' };
    }

    const students = await Student.find(query)
      .populate('userId', 'username email')
      .populate('courses', 'courseName courseCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // total count of students
    const totalCount = await Student.countDocuments(query);

    res.json({
      message: 'All students retrieved successfully',
      students,
      totalPages: Math.ceil(totalCount / limit),
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total: totalCount,
    });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error occurred in retrieving students',
      error: error.message,
    });
  }
};


export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'username email').populate('courses', 'courseName courseCode').populate('grades.courseID', 'courseName courseCode').populate('clinic', 'clinicName clinicAddress');

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    res.student(student);

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error occurred in retrieving student',
      error: error.message,
    });
  }
};


export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    // Check if user is updating their own profile or is admin

    if (req.user.role !== 'admin' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updateStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({
      message: 'Student updated successfully',
      student: updateStudent,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error in updating student', error: error.message })
  }
}

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }
    // Check if user is deleting their own profile or is admin

    if (req.user.role !== 'admin' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete user account
    await Student.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(student.userId, { isActive: false });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error occurred in deleting student', error: error.message
    });
  }
};
