import mongoose from 'mongoose';

const mealFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  mealScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealSchedule',
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner']
  },
  date: {
    type: Date,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  categories: {
    taste: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    portion: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  suggestions: {
    type: String,
    maxlength: 300
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one feedback per student per meal per day
mealFeedbackSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

export default mongoose.model('MealFeedback', mealFeedbackSchema);