const User = require('../models/User');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const { deleteFromCloudinary } = require('../services/cloudinaryService');
const { logAction } = require('../services/auditService');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDocuments, storageAgg, suspendedCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Document.countDocuments(),
      Document.aggregate([{ $group: { _id: null, total: { $sum: '$fileSizeBytes' } } }]),
      User.countDocuments({ isActive: false }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDocuments,
        totalStorageBytes: storageAgg[0]?.total || 0,
        suspendedAccounts: suspendedCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    // Attach doc counts
    const userIds = users.map((u) => u._id);
    const docCounts = await Document.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(docCounts.map((d) => [d._id.toString(), d.count]));

    const data = users.map((u) => ({
      ...u.toObject(),
      documentCount: countMap[u._id.toString()] || 0,
    }));

    res.json({ success: true, data, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = isActive;
    await user.save();

    const action = isActive ? 'REACTIVATE_USER' : 'SUSPEND_USER';
    await logAction({ userId: req.user._id, action, ipAddress: req.ip, details: { targetUserId: user._id } });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete all docs from cloud
    const docs = await Document.find({ userId: user._id });
    await Promise.allSettled(
      docs.map((d) => deleteFromCloudinary(d.filePublicId, d.fileType === 'application/pdf' ? 'raw' : 'image'))
    );

    await Document.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    await logAction({ userId: req.user._id, action: 'DELETE_USER', ipAddress: req.ip, details: { deletedUserId: user._id } });

    res.json({ success: true, message: 'User and all their data permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/categories
exports.manageCategory = async (req, res, next) => {
  try {
    const { name, isActive, action } = req.body;

    if (action === 'add') {
      const cat = await Category.create({ name });
      await logAction({ userId: req.user._id, action: 'ADD_CATEGORY', ipAddress: req.ip, details: { name } });
      return res.status(201).json({ success: true, data: cat });
    }

    if (action === 'deactivate') {
      const cat = await Category.findOneAndUpdate({ name }, { isActive }, { new: true });
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
      await logAction({ userId: req.user._id, action: 'DEACTIVATE_CATEGORY', ipAddress: req.ip, details: { name } });
      return res.json({ success: true, data: cat });
    }

    res.status(400).json({ success: false, message: 'Invalid action.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, from, to, page = 1, limit = 50 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'fullName email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};
