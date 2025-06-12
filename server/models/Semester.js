import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationStartDate: {
    type: Date,
    required: true
  },
  registrationEndDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isRegistrationOpen: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
semesterSchema.index({ academicYear: 1, isActive: 1 });
semesterSchema.index({ registrationStartDate: 1, registrationEndDate: 1 });

// Virtual to check if registration is currently open
semesterSchema.virtual('isRegistrationCurrentlyOpen').get(function () {
  const now = new Date();
  return this.isRegistrationOpen &&
    now >= this.registrationStartDate &&
    now <= this.registrationEndDate;
});

// Ensure only one active semester at a time
semesterSchema.pre('save', async function (next) {
  if (this.isActive && this.isModified('isActive')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

export default mongoose.model('Semester', semesterSchema);