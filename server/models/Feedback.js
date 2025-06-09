import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return !this.isAnonymous;
    }
  },
  type: {
    type: String,
    enum: ['suggestion', 'complaint', 'feedback', 'bug_report', 'feature_request'],
    required: [true, 'Feedback type is required']
  },
  category: {
    type: String,
    enum: ['clinic', 'admin', 'course', 'instructor', 'facility', 'system', 'general'],
    required: [true, 'Category is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  relatedTo: {
    type: String,
    trim: true,
    maxlength: [100, 'Related to field cannot exceed 100 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'resolved', 'closed', 'rejected'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, category: 1 });
feedbackSchema.index({ senderId: 1 });
feedbackSchema.index({ isAnonymous: 1 });
feedbackSchema.index({ priority: 1, status: 1 });

export default mongoose.model('Feedback', feedbackSchema);