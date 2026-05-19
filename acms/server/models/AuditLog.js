const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'REGISTER',
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'UPLOAD',
      'DELETE_DOCUMENT',
      'UPDATE_DOCUMENT',
      'UPDATE_PROFILE',
      'CHANGE_PASSWORD',
      'DELETE_ACCOUNT',
      'FORGOT_PASSWORD',
      'RESET_PASSWORD',
      'SUSPEND_USER',
      'REACTIVATE_USER',
      'DELETE_USER',
      'ADD_CATEGORY',
      'DEACTIVATE_CATEGORY',
    ],
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

auditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
