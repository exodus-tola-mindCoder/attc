import HealthRecord from '../models/HealthRecord.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const createHealthRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    const { studentId } = req.body;
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if health record already exists
    const existingRecord = await HealthRecord.findOne({ studentId });
    if (existingRecord) {
      return res.status(400).json({
        message: 'Health record already exists for this student'
      });
    }

    const healthRecord = new HealthRecord({
      ...req.body,
      lastUpdatedBy: req.user._id
    });


    await healthRecord.save();
    await healthRecord.populate('studentId', 'fullName studentId');

    logger.info(`Health record created for student ${studentId} by user ${req.user._id}`);
    res.status(201).json({
      message: 'Health record created successfully',
      healthRecord
    });
  } catch (error) {
    logger.error('Error creating health record:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getAllHealthRecords = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      search,
      bloodType,
      hasDisabilities,
      hasAllergies,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };


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

    // Filter by blood type
    if (bloodType && bloodType !== 'All') {
      query.bloodType = bloodType;
    }

    // Filter by disabilities
    if (hasDisabilities === 'true') {
      query.disabilities = { $ne: 'None' };
    } else if (hasDisabilities === 'false') {
      query.disabilities = 'None';
    }

    // Filter by allergies
    if (hasAllergies === 'true') {
      query.allergies = { $exists: true, $ne: [] };
    } else if (hasAllergies === 'false') {
      query.allergies = { $size: 0 };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const healthRecords = await HealthRecord.find(query)
      .populate('studentId', 'fullName studentId familyInfo.city')
      .populate('lastUpdatedBy', 'username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HealthRecord.countDocuments(query);


    res.json({
      healthRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });

  } catch (error) {
    logger.error('Error fetching health records:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getHealthRecordByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const healthRecord = await HealthRecord.findOne({
      studentId,
      isActive: true
    })
      .populate('studentId', 'fullName studentId familyInfo healthInfo')
      .populate('lastUpdatedBy', 'username')
      .populate('medicalVisits.doctor', 'username');

    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    res.json(healthRecord);

  } catch (error) {
    logger.error('Error fetching health record:', error);
    res.status(500).json({
      message: 'Server error in get health recorder controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateHealthRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    const { studentId } = req.params;


    const healthRecord = await HealthRecord.findOneAndUpdate(
      { studentId, isActive: true },
      {
        ...req.body,
        lastUpdatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'fullName studentId');

    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    logger.info(`Health record updated for student ${studentId} by user ${req.user._id}`);

    res.json({
      message: 'Health record updated successfully',
      healthRecord
    });

  } catch (error) {
    logger.error('Error updating health record:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    const healthRecord = await HealthRecord.findOneAndUpdate(
      { studentId, isActive: true },
      {
        isActive: false,
        lastUpdatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    logger.info(`Health record deleted for student ${studentId} by user ${req.user._id}`);

    res.json({ message: 'Health record deleted successfully' });

  } catch (error) {
    logger.error('Error deleting health record:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const addMedicalVisit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId } = req.params;

    const healthRecord = await HealthRecord.findOne({
      studentId,
      isActive: true
    });


    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }


    healthRecord.medicalVisits.push(req.body);
    healthRecord.lastUpdatedBy = req.user._id;
    healthRecord.updatedAt = new Date();

    await healthRecord.save();

    logger.info(`Medical visit added for student ${studentId} by user ${req.user._id}`);

    res.status(201).json({
      message: 'Medical visit added successfully',
      visit: healthRecord.medicalVisits[healthRecord.medicalVisits.length - 1]
    });
  } catch (error) {
    logger.error('Error adding medical visit:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const getHealthStatistics = async (req, res) => {
  try {
    const totalRecords = await HealthRecord.countDocuments({ isActive: true });


    const bloodTypeStats = await HealthRecord.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const disabilityStats = await HealthRecord.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            hasDisabilities: {
              $cond: [
                { $eq: ['$disabilities', 'None'] },
                'No Disabilities',
                'Has Disabilities'
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);


    const allergyStats = await HealthRecord.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            hasAllergies: {
              $cond: [
                { $eq: [{ $size: '$allergies' }, 0] },
                'No Allergies',
                'Has Allergies'
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);


    const recentVisits = await HealthRecord.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$medicalVisits' },
      { $sort: { 'medicalVisits.visitDate': -1 } },
      { $limit: 10 },
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
        $project: {
          visitDate: '$medicalVisits.visitDate',
          reason: '$medicalVisits.reason',
          doctor: '$medicalVisits.doctor',
          studentName: '$student.fullName',
          studentId: '$student.studentId'
        }
      }
    ]);


    res.json({
      overview: {
        totalRecords,
        totalVisits: await HealthRecord.aggregate([
          { $match: { isActive: true } },
          { $project: { visitCount: { $size: '$medicalVisits' } } },
          { $group: { _id: null, total: { $sum: '$visitCount' } } }
        ]).then(result => result[0]?.total || 0)
      },
      bloodTypeStats,
      disabilityStats,
      allergyStats,
      recentVisits
    });

  } catch (error) {
    logger.error('Error fetching health statistics:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

