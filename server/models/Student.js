import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    unique: true,
    required: true
  },
  backgroundEducation: {
    grade1to8School: {
      type: String,
      required: true
    },
    grade9to10School: {
      type: String,
      required: true
    },
    grade11to12School: {
      type: String,
      required: true
    },
    yearsAttended: {
      grade1to8: { type: String, required: true },
      grade9to10: { type: String, required: true },
      grade11to12: { type: String, required: true }
    }
  },
  familyInfo: {
    fatherName: {
      type: String,
      required: true
    },
    motherName: {
      type: String,
      required: true
    },
    kebele: {
      type: String,
      required: true
    },
    wereda: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }
  },
  transcripts: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  healthInfo: {
    disabilities: {
      type: String,
      default: 'None'
    },
    diseases: {
      type: String,
      default: 'None'
    },
    supportNeeded: {
      type: String,
      default: 'None'
    },
    bloodType: String,
    allergies: String,
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  grades: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    semester: String,
    year: Number
  }],
  profileImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);