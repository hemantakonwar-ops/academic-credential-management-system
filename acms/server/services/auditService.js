const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, action, ipAddress, details = {} }) => {
  try {
    await AuditLog.create({ userId, action, ipAddress, details, timestamp: new Date() });
  } catch (err) {
    // Never crash the app because of audit log failure
    console.error('AuditLog error:', err.message);
  }
};

module.exports = { logAction };
