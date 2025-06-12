import Department from '../models/Department.js';
import { validationResult } from 'express-validator';

import logger from '../utils/logger.js';

export const createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      return res.status(400).json({
        message: 'Validation Failed',
        errors: errors.array()
      });
    }

    const department = new Department(req.body);
    await department.save();

    logger.info(`Department created: ${department.name} by user ${req.user._id}`);

    res.status(201).json({
      message: 'Department created successfully',
      department
    });


  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Department with this ${field} already exists`
      });
    }
    logger.error('Error creating department:', error);
    res.status(500).json({
      message: 'Server error in creating department controller',
      error: process.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const getAllDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      faculty,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { head: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by faculty
    if (faculty && faculty !== 'All') {
      query.faculty = { $regex: faculty, $options: 'i' };
    }


    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const departments = await Department.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Department.countDocuments(query);

    res.json({
      departments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });


  } catch (error) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({
      message: 'Server error in the getting department controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  }
};


export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);


    if (!department || !department.isActive) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);


  } catch (error) {

    logger.error('Error fetching department:', error);
    res.status(500).json({
      message: 'Server error in the getting department controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  }
};


export const updateDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation Failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;


    const department = await Department.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    logger.info(`Department updated: ${department.name} by user ${req.user._id}`)


    res.json({
      message: 'Department updated successfully',
      department
    });

  } catch (error) {

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Department with this ${field} already exists`
      });
    }
    logger.error('Error updating department:', error);
    res.status(500).json({
      message: 'Server error in the updating department controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  }
};


export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id, { isActive: false }, { new: true }, { runValidators: true });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    logger.info(`Department deleted: ${department.name} by user ${req.user._id}`);

    res.json({
      message: 'Department deleted successfully',
    })

  } catch (error) {

    logger.error('Error deleting department:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  }
};

export const getDepartmentStatistics = async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments({ isActive: true });

    const facultyStats = await Department.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$faculty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const programStats = await Department.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$programsOffered' },
      { $group: { _id: '$programsOffered.degree', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalDepartments,
        totalPrograms: await Department.aggregate([
          { $match: { isActive: true } },
          { $project: { programCount: { $size: '$programsOffered' } } },
          { $group: { _id: null, total: { $sum: '$programCount' } } }
        ]).then(result => result[0]?.total || 0)
      },
      facultyStats,
      programStats
    });

  } catch (error) {

    logger.error('Error fetching department statistics:', error);
    res.status(500).json({
      message: 'Server error in the getting department statistics controller',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })

  }
};
