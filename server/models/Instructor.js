import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (phone) {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  coursesTaught: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    trim: true
  },
  photoUrl: {
    type: String,
    validate: {
      validator: function (url) {
        return !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url);
      },
      message: 'Please provide a valid image URL'
    }
  },
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear()
    }
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  specializations: [{
    type: String,
    trim: true
  }],
  officeHours: {
    type: String,
    trim: true
  },
  officeLocation: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
instructorSchema.index({ email: 1 });
instructorSchema.index({ department: 1 });
instructorSchema.index({ isActive: 1 });

// Virtual for full course details
instructorSchema.virtual('courses', {
  ref: 'Course',
  localField: 'coursesTaught',
  foreignField: '_id'
});

instructorSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Instructor', instructorSchema);