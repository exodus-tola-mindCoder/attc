import mongoose from 'mongoose';

const leaveApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['sick', 'family', 'personal', 'academic', 'emergency'],
    required: [true, 'Leave type is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },
  fromDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function (date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Start date cannot be in the past'
    }
  },
  toDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function (date) {
        return date >= this.fromDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewComments: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comments cannot exceed 500 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  duration: {
    type: Number,
    min: 1
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  contactDuringLeave: {
    phone: String,
    email: String,
    address: String
  }
}, {
  timestamps: true
});

// Calculate duration before saving
leaveApplicationSchema.pre('save', function (next) {
  if (this.fromDate && this.toDate) {
    const timeDiff = this.toDate.getTime() - this.fromDate.getTime();
    this.duration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }
  next();
});

// Indexes
leaveApplicationSchema.index({ studentId: 1, status: 1 });
leaveApplicationSchema.index({ fromDate: 1, toDate: 1 });
leaveApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('LeaveApplication', leaveApplicationSchema);