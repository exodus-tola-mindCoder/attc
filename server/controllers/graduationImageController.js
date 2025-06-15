import GraduationImage from '../models/GraduationImage.js';
import { validationResult } from 'express-validator';

// Get graduation images with optional filtering
export const getGraduationImages = async (req, res) => {
  try {
    const { year, department, page = 1, limit = 12, sortBy = 'uploadDate', sortOrder = 'desc' } = req.query;

    let query = { isActive: true };

    // Apply filters
    if (year) {
      query.year = parseInt(year);
    }

    if (department && department !== 'all') {
      query.department = { $regex: department, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const images = await GraduationImage.find(query)
      .populate('uploadedBy', 'username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GraduationImage.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get available years and departments for filtering
    const availableYears = await GraduationImage.distinct('year', { isActive: true });
    const availableDepartments = await GraduationImage.distinct('department', { isActive: true });

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        filters: {
          availableYears: availableYears.sort((a, b) => b - a),
          availableDepartments: availableDepartments.sort()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching graduation images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch graduation images'
    });
  }
};

// Upload new graduation image (admin only)
export const uploadGraduationImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { imageUrl, year, department, caption, tags, metadata } = req.body;

    // Check if image URL already exists
    const existingImage = await GraduationImage.findOne({ imageUrl, isActive: true });
    if (existingImage) {
      return res.status(400).json({
        success: false,
        message: 'This image has already been uploaded'
      });
    }

    const graduationImage = new GraduationImage({
      imageUrl,
      year: parseInt(year),
      department,
      caption,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      uploadedBy: req.user.id,
      metadata
    });

    await graduationImage.save();
    await graduationImage.populate('uploadedBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Graduation image uploaded successfully',
      data: graduationImage
    });
  } catch (error) {
    console.error('Error uploading graduation image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload graduation image'
    });
  }
};

// Get single graduation image by ID
export const getGraduationImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GraduationImage.findOne({ _id: id, isActive: true })
      .populate('uploadedBy', 'username');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Graduation image not found'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error fetching graduation image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch graduation image'
    });
  }
};

// Update graduation image (admin only)
export const updateGraduationImage = async (req, res) => {
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
    const { year, department, caption, tags } = req.body;

    const image = await GraduationImage.findOne({ _id: id, isActive: true });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Graduation image not found'
      });
    }

    // Update fields
    if (year) image.year = parseInt(year);
    if (department) image.department = department;
    if (caption !== undefined) image.caption = caption;
    if (tags !== undefined) {
      image.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    }

    await image.save();
    await image.populate('uploadedBy', 'username');

    res.json({
      success: true,
      message: 'Graduation image updated successfully',
      data: image
    });
  } catch (error) {
    console.error('Error updating graduation image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update graduation image'
    });
  }
};

// Delete graduation image (admin only)
export const deleteGraduationImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GraduationImage.findOne({ _id: id, isActive: true });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Graduation image not found'
      });
    }

    // Soft delete by setting isActive to false
    image.isActive = false;
    await image.save();

    res.json({
      success: true,
      message: 'Graduation image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting graduation image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete graduation image'
    });
  }
};

// Get graduation gallery statistics (admin only)
export const getGalleryStatistics = async (req, res) => {
  try {
    const totalImages = await GraduationImage.countDocuments({ isActive: true });

    const imagesByYear = await GraduationImage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const imagesByDepartment = await GraduationImage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentUploads = await GraduationImage.find({ isActive: true })
      .populate('uploadedBy', 'username')
      .sort({ uploadDate: -1 })
      .limit(5);

    const currentYear = new Date().getFullYear();
    const thisYearImages = await GraduationImage.countDocuments({
      isActive: true,
      year: currentYear
    });

    res.json({
      success: true,
      data: {
        totalImages,
        thisYearImages,
        imagesByYear,
        imagesByDepartment,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Error fetching gallery statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics'
    });
  }
};

// Get images for admin management
export const getImagesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, year, department, search } = req.query;

    let query = { isActive: true };

    if (year) {
      query.year = parseInt(year);
    }

    if (department && department !== 'all') {
      query.department = { $regex: department, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const images = await GraduationImage.find(query)
      .populate('uploadedBy', 'username')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GraduationImage.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching images for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images for admin'
    });
  }
};