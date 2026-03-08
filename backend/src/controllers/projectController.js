const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Project = require('../models/Project');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsProjectsSegment = '/uploads/projects/';
const allowedStatus = ['Planning', 'Ongoing', 'Completed', 'Upcoming'];

const sanitize = (value) => String(value ?? '').trim();
const isValidImageUrl = (value) => /^https?:\/\/.+/i.test(value);

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(uploadsProjectsSegment)) {
      return;
    }
    const fileName = imageUrl.split(uploadsProjectsSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }

    const filePath = `uploads/projects/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore local file cleanup errors.
  }
};

const validatePayload = (payload) => {
  const data = {
    title: sanitize(payload.title),
    type: sanitize(payload.type),
    location: sanitize(payload.location),
    year: sanitize(payload.year),
    status: sanitize(payload.status),
    imageUrl: sanitize(payload.imageUrl),
    featured: Boolean(payload.featured),
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
  };

  if (!data.title || data.title.length > 120) {
    return { ok: false, message: 'Title is required and must be max 120 characters' };
  }
  if (!data.type || data.type.length > 80) {
    return { ok: false, message: 'Type is required and must be max 80 characters' };
  }
  if (!data.location || data.location.length > 80) {
    return { ok: false, message: 'Location is required and must be max 80 characters' };
  }
  if (!/^\d{4}$/.test(data.year)) {
    return { ok: false, message: 'Year must be a valid 4-digit value' };
  }
  if (!allowedStatus.includes(data.status)) {
    return { ok: false, message: `Status must be one of: ${allowedStatus.join(', ')}` };
  }
  if (!data.imageUrl || !isValidImageUrl(data.imageUrl)) {
    return { ok: false, message: 'Project image is required and must be valid http/https URL' };
  }
  if (data.sortOrder < 0 || data.sortOrder > 9999) {
    return { ok: false, message: 'Sort order must be between 0 and 9999' };
  }
  if (
    scriptTagRegex.test(data.title) ||
    scriptTagRegex.test(data.type) ||
    scriptTagRegex.test(data.location)
  ) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  return { ok: true, data };
};

const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

const getPublicProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const created = await Project.create(validation.data);
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project id' });
    }

    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await Project.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updated = await Project.findByIdAndUpdate(id, validation.data, { new: true }).lean();
    if (existing.imageUrl && existing.imageUrl !== validation.data.imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project id' });
    }

    const deleted = await Project.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    safeDeleteLocalImageByUrl(deleted.imageUrl);
    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
};

const uploadProjectImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Project image file is required' });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 1000 || height < 700) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 1000x700',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/projects/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Project image uploaded successfully',
      data: { imageUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload project image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminProjects,
  getPublicProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
};
