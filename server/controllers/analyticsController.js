import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Message from '../models/Message.js';

export const getStudentsByCity = async (req, res) => {
  try {
    const cityStats = await Student.aggregate([
      {
        $group: {
          _id: '$familyInfo.city',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(cityStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHealthStatus = async (req, res) => {
  try {
    const healthStats = await Student.aggregate([
      {
        $group: {
          _id: {
            hasDisabilities: {
              $cond: [
                { $eq: ['$healthInfo.disabilities', 'None'] },
                'No Disabilities',
                'Has Disabilities'
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const diseaseStats = await Student.aggregate([
      {
        $group: {
          _id: {
            hasDiseases: {
              $cond: [
                { $eq: ['$healthInfo.diseases', 'None'] },
                'No Diseases',
                'Has Diseases'
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({
      disabilities: healthStats,
      diseases: diseaseStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEnrollmentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalMessages = await Message.countDocuments();
    const gradeStats = await Student.aggregate([
      { $unwind: '$grades' },
      {
        $group: {
          _id: null,
          averageGrade: { $avg: '$grades.grade' },
          totalGrades: { $sum: 1 }
        }
      }
    ]);


    const semesterEnrollment = await Course.aggregate([
      {
        $group: {
          _id: '$semester',
          courses: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({
      overview: {
        totalStudents,
        totalCourses,
        totalMessages,
        averageGrade: gradeStats[0]?.averageGrade || 0,
        totalGrades: gradeStats[0]?.totalGrades || 0
      },
      semesterEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const recentStudents = await Student.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMessages = await Message.find()
      .populate('senderId', 'username role')
      .populate('receiverId', 'username role')
      .sort({ createdAt: -1 })
      .limit(5);


    res.json({
      recentStudents,
      recentMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


