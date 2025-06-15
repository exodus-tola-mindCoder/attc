import mongoose from 'mongoose';

const courseRegistrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'dropped', 'pending', 'approved', 'rejected'],
    default: 'registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  dropDate: {
    type: Date
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
courseRegistrationSchema.index({
  studentId: 1,
  courseId: 1,
  semesterId: 1
}, { unique: true });

// Index for efficient querying
courseRegistrationSchema.index({ semesterId: 1, status: 1 });
courseRegistrationSchema.index({ studentId: 1, status: 1 });

// Calculate grade points based on grade
courseRegistrationSchema.pre('save', function (next) {
  if (this.grade !== undefined) {
    if (this.grade >= 85) this.gradePoints = 4.0;
    else if (this.grade >= 80) this.gradePoints = 3.7;
    else if (this.grade >= 75) this.gradePoints = 3.5;
    else if (this.grade >= 70) this.gradePoints = 3.0;
    else if (this.grade >= 70) this.gradePoints = 2.7;
    else if (this.grade >= 65) this.gradePoints = 2.3;
    else if (this.grade >= 60) this.gradePoints = 2.0;
    else if (this.grade >= 50) this.gradePoints = 1.0;
    else this.gradePoints = 0.0;
  }
  next();
});

export default mongoose.model('CourseRegistration', courseRegistrationSchema);