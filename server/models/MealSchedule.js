import mongoose from 'mongoose';

const mealScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: [true, 'Meal type is required']
  },
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['main', 'side', 'dessert', 'beverage', 'salad'],
      default: 'main'
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    allergens: [{
      type: String,
      trim: true
    }],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    }
  }],
  specialNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Special notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
mealScheduleSchema.index({ date: 1, mealType: 1 }, { unique: true });
mealScheduleSchema.index({ date: 1, isActive: 1 });

// Virtual for formatted date
mealScheduleSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString();
});

mealScheduleSchema.set('toJSON', { virtuals: true });

export default mongoose.model('MealSchedule', mealScheduleSchema);