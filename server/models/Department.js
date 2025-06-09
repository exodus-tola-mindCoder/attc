import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  head: {
    type: String,
    required: [true, 'Department head is required'],
    trim: true,
    maxlength: [100, 'Department head name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: [500, 'Rule cannot exceed 500 characters']
  }],
  entranceRequirements: [{
    type: String,
    trim: true,
    maxlength: [300, 'Requirement cannot exceed 300 characters']
  }],
  programsOffered: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      enum: ['Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD'],
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true
  },
  establishedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  location: {
    building: String,
    floor: String,
    room: String
  },
  contact: {
    phone: {
      type: String,
      validate: {
        validator: function (phone) {
          return !phone || /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
        },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function (email) {
          return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    website: String
  },
  statistics: {
    totalStudents: { type: Number, default: 0 },
    totalInstructors: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ faculty: 1 });
departmentSchema.index({ isActive: 1 });

export default mongoose.model('Department', departmentSchema);