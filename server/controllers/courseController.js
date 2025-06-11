import Course from '../models/Course.js';
import Student from '../models/Student.js';

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({
      semseter: 1, courseName: 1
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: 'Server error in the get all course controller',
      error: error.message
    });
  }
};


export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: course
    });
  } catch (error) {
    res.status(500).status({
      message: 'Server error in the create course controller',
      error: error.message
    });
  }
};


export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({

    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error in the update course controller',
      error: error.message
    })
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error in the delete course controller',
      error: error.message
    })
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const student = await Student.findById(studentId);

    if (!studentId) {
      return res.status(404).json({
        message: 'Student not found'
      });
    };

    const course = await Course.findByI(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    if (student.courses.includes(courseId)) {
      return res.status(400).json({
        message: 'Student already enrolled in this course'
      });
    }

    student.courses.push(courseId);
    await student.save();
  } catch (error) {
    res.status(500).json({
      message: 'Server error in the enroll student controller',
      error: error.message
    })
  }
};