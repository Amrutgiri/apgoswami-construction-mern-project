const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Service = require('../models/Service');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsServicesSegment = '/uploads/services/';

const sanitize = (value) => String(value ?? '').trim();

const isValidImageUrl = (value) => /^https?:\/\/.+/i.test(value);

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return;
    }
    if (!imageUrl.includes(uploadsServicesSegment)) {
      return;
    }

    const fileName = imageUrl.split(uploadsServicesSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }

    const filePath = `uploads/services/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore file cleanup failures to avoid blocking content updates.
  }
};

const validatePayload = (payload) => {
  const data = {
    title: sanitize(payload.title),
    description: sanitize(payload.description),
    imageUrl: sanitize(payload.imageUrl),
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
  };

  if (!data.title || data.title.length > 120) {
    return { ok: false, message: 'Title is required and must be max 120 characters' };
  }
  if (!data.description || data.description.length > 300) {
    return { ok: false, message: 'Description is required and must be max 300 characters' };
  }
  if (!data.imageUrl || !isValidImageUrl(data.imageUrl)) {
    return { ok: false, message: 'Service image is required and must be valid http/https URL' };
  }
  if (data.sortOrder < 0 || data.sortOrder > 9999) {
    return { ok: false, message: 'Sort order must be between 0 and 9999' };
  }

  if (scriptTagRegex.test(data.title) || scriptTagRegex.test(data.description)) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  return { ok: true, data };
};

const getAdminServices = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
};

const getPublicServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
};

const createService = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const created = await Service.create(validation.data);
    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service id' });
    }

    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await Service.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const updated = await Service.findByIdAndUpdate(id, validation.data, { new: true }).lean();
    if (existing.imageUrl && existing.imageUrl !== validation.data.imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service id' });
    }

    const deleted = await Service.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    safeDeleteLocalImageByUrl(deleted.imageUrl);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message,
    });
  }
};

const uploadServiceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Service image file is required' });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 800 || height < 600) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 800x600',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/services/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Service image uploaded successfully',
      data: { imageUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload service image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminServices,
  getPublicServices,
  createService,
  updateService,
  deleteService,
  uploadServiceImage,
};
