const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Testimonial = require('../models/Testimonial');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsTestimonialsSegment = '/uploads/testimonials/';

const sanitize = (value) => String(value ?? '').trim();
const isValidImageUrl = (value) => /^https?:\/\/.+/i.test(value);

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(uploadsTestimonialsSegment)) {
      return;
    }
    const fileName = imageUrl.split(uploadsTestimonialsSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }
    const filePath = `uploads/testimonials/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore file cleanup errors.
  }
};

const validatePayload = (payload) => {
  const data = {
    name: sanitize(payload.name),
    role: sanitize(payload.role),
    text: sanitize(payload.text),
    rating: Number.isFinite(Number(payload.rating)) ? Number(payload.rating) : 5,
    avatarUrl: sanitize(payload.avatarUrl),
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
  };

  if (!data.name || data.name.length > 80) {
    return { ok: false, message: 'Name is required and must be max 80 characters' };
  }
  if (!data.role || data.role.length > 120) {
    return { ok: false, message: 'Role is required and must be max 120 characters' };
  }
  if (!data.text || data.text.length > 500) {
    return { ok: false, message: 'Message is required and must be max 500 characters' };
  }
  if (data.rating < 1 || data.rating > 5) {
    return { ok: false, message: 'Rating must be between 1 and 5' };
  }
  if (data.avatarUrl && !isValidImageUrl(data.avatarUrl)) {
    return { ok: false, message: 'Avatar URL must be valid http/https URL' };
  }
  if (data.sortOrder < 0 || data.sortOrder > 9999) {
    return { ok: false, message: 'Sort order must be between 0 and 9999' };
  }
  if (scriptTagRegex.test(data.name) || scriptTagRegex.test(data.role) || scriptTagRegex.test(data.text)) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  return { ok: true, data };
};

const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message,
    });
  }
};

const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message,
    });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const created = await Testimonial.create(validation.data);
    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message,
    });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid testimonial id' });
    }

    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await Testimonial.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const updated = await Testimonial.findByIdAndUpdate(id, validation.data, { new: true }).lean();
    if (existing.avatarUrl && existing.avatarUrl !== validation.data.avatarUrl) {
      safeDeleteLocalImageByUrl(existing.avatarUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message,
    });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid testimonial id' });
    }

    const deleted = await Testimonial.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    safeDeleteLocalImageByUrl(deleted.avatarUrl);

    return res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message,
    });
  }
};

const uploadTestimonialAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Avatar image file is required' });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 300 || height < 300) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 300x300',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/testimonials/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialAvatar,
};
