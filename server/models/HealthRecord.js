import mongoose from 'mongoose';

const medicalVisitSchema = new mongoose.Schema({
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    validate: {
      validator: function (date) {
        return date <= new Date();
      },
      message: 'Visit date cannot be in the future'
    }
  },
  reason: {
    type: String,
    required: [true, 'Visit reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  treatment: {
    type: String,
    required: [true, 'Treatment description is required'],
    trim: true,
    maxlength: [1000, 'Treatment description cannot exceed 1000 characters']
  },
  doctor: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    validate: {
      validator: function (date) {
        return !this.followUpRequired || (date && date > new Date());
      },
      message: 'Follow-up date must be in the future when follow-up is required'
    }
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    }
  }],
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  }
}, {
  timestamps: true
});

const healthRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    unique: true,
    index: true
  },
  disabilities: {
    type: String,
    trim: true,
    default: 'None',
    maxlength: [1000, 'Disabilities description cannot exceed 1000 characters']
  },
  diseases: {
    type: String,
    trim: true,
    default: 'None',
    maxlength: [1000, 'Diseases description cannot exceed 1000 characters']
  },
  supportNeeded: {
    type: String,
    trim: true,
    default: 'None',
    maxlength: [1000, 'Support needed description cannot exceed 1000 characters']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  allergies: [{
    allergen: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      required: true
    },
    reaction: {
      type: String,
      required: true,
      trim: true
    }
  }],
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      validate: {
        validator: function (phone) {
          return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
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
    }
  },
  medicalVisits: [medicalVisitSchema],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  confidentialNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Confidential notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
healthRecordSchema.index({ studentId: 1 });
healthRecordSchema.index({ 'medicalVisits.visitDate': -1 });
healthRecordSchema.index({ bloodType: 1 });
healthRecordSchema.index({ isActive: 1 });

// Virtual for student population
healthRecordSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
healthRecordSchema.set('toJSON', { virtuals: true });

export default mongoose.model('HealthRecord', healthRecordSchema);