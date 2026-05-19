const Document = require('../models/Document');
const { uploadToCloudinary, deleteFromCloudinary, getSignedUrl } = require('../services/cloudinaryService');
const { logAction } = require('../services/auditService');

// GET /api/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search, category, from, to, institution, page = 1, limit = 20 } = req.query;

    const query = { userId };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (institution) query.institutionName = new RegExp(institution, 'i');
    if (from || to) {
      query.uploadDate = {};
      if (from) query.uploadDate.$gte = new Date(from);
      if (to) query.uploadDate.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Document.countDocuments(query);
    const docs = await Document.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: docs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, category, institutionName, remarks } = req.body;
    const { buffer, mimetype, originalname, size } = req.file;

    const cloudResult = await uploadToCloudinary(buffer, originalname, mimetype);

    const doc = await Document.create({
      userId: req.user._id,
      title,
      category,
      institutionName,
      remarks,
      fileUrl: cloudResult.secure_url,
      filePublicId: cloudResult.public_id,
      fileType: mimetype,
      fileSizeBytes: size,
      uploadDate: new Date(),
    });

    await logAction({
      userId: req.user._id,
      action: 'UPLOAD',
      ipAddress: req.ip,
      details: { documentId: doc._id, title, category },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const resourceType = doc.fileType === 'application/pdf' ? 'raw' : 'image';
    const signedUrl = getSignedUrl(doc.filePublicId, resourceType);

    res.json({ success: true, data: { ...doc.toObject(), signedUrl } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/documents/:id
exports.updateDocument = async (req, res, next) => {
  try {
    const { title, category, institutionName, remarks } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    doc.title = title ?? doc.title;
    doc.category = category ?? doc.category;
    doc.institutionName = institutionName ?? doc.institutionName;
    doc.remarks = remarks ?? doc.remarks;
    doc.lastModified = new Date();
    await doc.save();

    await logAction({
      userId: req.user._id,
      action: 'UPDATE_DOCUMENT',
      ipAddress: req.ip,
      details: { documentId: doc._id },
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const resourceType = doc.fileType === 'application/pdf' ? 'raw' : 'image';
    await deleteFromCloudinary(doc.filePublicId, resourceType);
    await doc.deleteOne();

    await logAction({
      userId: req.user._id,
      action: 'DELETE_DOCUMENT',
      ipAddress: req.ip,
      details: { documentId: doc._id, title: doc.title },
    });

    res.json({ success: true, message: 'Document permanently deleted.' });
  } catch (err) {
    next(err);
  }
};
