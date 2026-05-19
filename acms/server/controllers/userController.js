const User = require('../models/User');
const Document = require('../models/Document');
const { deleteFromCloudinary } = require('../services/cloudinaryService');
const { logAction } = require('../services/auditService');
const bcrypt = require('bcryptjs');

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;

    const docStats = await Document.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalDocs: { $sum: 1 },
          totalStorage: { $sum: '$fileSizeBytes' },
        },
      },
    ]);

    res.json({
      success: true,
      user,
      stats: docStats[0] || { totalDocs: 0, totalStorage: 0 },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { fullName, institution, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, institution, profilePicture },
      { new: true, runValidators: true }
    );

    await logAction({ userId: user._id, action: 'UPDATE_PROFILE', ipAddress: req.ip });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    await logAction({ userId: user._id, action: 'CHANGE_PASSWORD', ipAddress: req.ip });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me
exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all documents from Cloudinary
    const docs = await Document.find({ userId });
    const deletePromises = docs.map((doc) => {
      const resourceType = doc.fileType === 'application/pdf' ? 'raw' : 'image';
      return deleteFromCloudinary(doc.filePublicId, resourceType).catch(console.error);
    });
    await Promise.allSettled(deletePromises);

    // Delete documents from DB
    await Document.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    await logAction({ userId, action: 'DELETE_ACCOUNT', ipAddress: req.ip });

    res.json({ success: true, message: 'Account and all associated data permanently deleted.' });
  } catch (err) {
    next(err);
  }
};
