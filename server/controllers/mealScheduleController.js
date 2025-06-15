import MealSchedule from '../models/MealSchedule.js';
import { validationResult } from 'express-validator';

// Get meal schedules with optional filtering
export const getMealSchedules = async (req, res) => {
  try {
    const { date, week, mealType, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (week) {
      // Get current week
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      query.date = { $gte: startOfWeek, $lte: endOfWeek };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      // Default to current week if no filter specified
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      query.date = { $gte: startOfWeek };
    }

    if (mealType) {
      query.mealType = mealType;
    }

    const schedules = await MealSchedule.find(query)
      .populate('createdBy', 'username')
      .sort({ date: 1, mealType: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching meal schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal schedules'
    });
  }
};

// Create new meal schedule
export const createMealSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, mealType, items, description, nutritionalInfo, allergens, isSpecialMenu } = req.body;

    // Check if schedule already exists for this date and meal type
    const existingSchedule = await MealSchedule.findOne({
      date: new Date(date),
      mealType
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Meal schedule already exists for this date and meal type'
      });
    }

    const schedule = new MealSchedule({
      date: new Date(date),
      mealType,
      items,
      description,
      nutritionalInfo,
      allergens,
      isSpecialMenu,
      createdBy: req.user.id
    });

    await schedule.save();
    await schedule.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Meal schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error creating meal schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meal schedule'
    });
  }
};

// Update meal schedule
export const updateMealSchedule = async (req, res) => {
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

    const schedule = await MealSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Meal schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating meal schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal schedule'
    });
  }
};

// Delete meal schedule
export const deleteMealSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await MealSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Meal schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal schedule'
    });
  }
};

// Get meal schedule by ID
export const getMealScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await MealSchedule.findById(id)
      .populate('createdBy', 'username');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Meal schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching meal schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal schedule'
    });
  }
};

// Get meal statistics
export const getMealStatistics = async (req, res) => {
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

    const totalSchedules = await MealSchedule.countDocuments(dateFilter);
    
    const mealTypeStats = await MealSchedule.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 }
        }
      }
    ]);

    const specialMenuCount = await MealSchedule.countDocuments({
      ...dateFilter,
      isSpecialMenu: true
    });

    res.json({
      success: true,
      data: {
        totalSchedules,
        mealTypeStats,
        specialMenuCount
      }
    });
  } catch (error) {
    console.error('Error fetching meal statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal statistics'
    });
  }
};