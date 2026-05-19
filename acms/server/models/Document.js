const mongoose = require('mongoose');

const CATEGORIES = [
  'Certificates',
  'Grade Reports / Mark Sheets',
  'ID Cards',
  'Transcripts',
  'Achievements',
  'Internship Documents',
  'Other Academic Records',
];

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category',
      },
    },
    institutionName: {
      type: String,
      trim: true,
      maxlength: [150, 'Institution name cannot exceed 150 characters'],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Compound indexes
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, uploadDate: -1 });
documentSchema.index({ title: 'text', remarks: 'text' });

// Update lastModified on save
documentSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
module.exports.CATEGORIES = CATEGORIES;
