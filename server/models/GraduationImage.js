import mongoose from 'mongoose';

const graduationImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 10
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 500
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    originalName: String,
    fileSize: Number,
    mimeType: String,
    dimensions: {
      width: Number,
      height: Number
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
graduationImageSchema.index({ year: -1, department: 1 });
graduationImageSchema.index({ uploadDate: -1 });
graduationImageSchema.index({ isActive: 1 });

export default mongoose.model('GraduationImage', graduationImageSchema);