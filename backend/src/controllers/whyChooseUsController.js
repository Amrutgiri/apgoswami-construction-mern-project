const fs = require('fs');
const sharp = require('sharp');
const WhyChooseUs = require('../models/WhyChooseUs');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsSegment = '/uploads/why-choose/';

const defaultData = {
  sectionTag: 'Why Choose Us',
  heading: 'Reliable Expertise For Every Construction Need',
  description:
    'We combine engineering precision, transparent project management, and quality craftsmanship to deliver spaces that perform for years.',
  imageUrl: '',
  badgeTitle: '15+ Years',
  badgeText: 'of trusted construction excellence.',
  points: [
    {
      title: 'Experienced Team',
      description: 'Qualified engineers, planners, and on-site experts with proven project execution skills.',
      iconKey: 'icon-1',
      sortOrder: 0,
    },
    {
      title: 'Quality Materials',
      description: 'Only trusted material partners and quality checks at every stage of construction.',
      iconKey: 'icon-2',
      sortOrder: 1,
    },
    {
      title: 'On-Time Delivery',
      description: 'Structured timelines and milestone tracking to ensure smooth and timely project handover.',
      iconKey: 'icon-3',
      sortOrder: 2,
    },
  ],
};

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(uploadsSegment)) {
      return;
    }
    const fileName = imageUrl.split(uploadsSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }
    const filePath = `uploads/why-choose/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup errors.
  }
};

const sanitize = (value) => String(value ?? '').trim();

const validatePayload = (payload) => {
  const pointsInput = Array.isArray(payload.points) ? payload.points : [];
  const points = pointsInput
    .map((point, index) => ({
      title: sanitize(point?.title),
      description: sanitize(point?.description),
      iconKey: ['icon-1', 'icon-2', 'icon-3'].includes(sanitize(point?.iconKey))
        ? sanitize(point?.iconKey)
        : 'icon-1',
      sortOrder: Number.isFinite(Number(point?.sortOrder)) ? Number(point.sortOrder) : index,
    }))
    .filter((point) => point.title && point.description);

  const data = {
    sectionTag: sanitize(payload.sectionTag),
    heading: sanitize(payload.heading),
    description: sanitize(payload.description),
    imageUrl: sanitize(payload.imageUrl),
    badgeTitle: sanitize(payload.badgeTitle),
    badgeText: sanitize(payload.badgeText),
    points: points.sort((a, b) => a.sortOrder - b.sortOrder),
  };

  if (!data.sectionTag || data.sectionTag.length > 60) {
    return { ok: false, message: 'Section tag is required and must be max 60 characters' };
  }
  if (!data.heading || data.heading.length > 150) {
    return { ok: false, message: 'Heading is required and must be max 150 characters' };
  }
  if (!data.description || data.description.length > 500) {
    return { ok: false, message: 'Description is required and must be max 500 characters' };
  }
  if (data.imageUrl && !/^https?:\/\/.+/i.test(data.imageUrl)) {
    return { ok: false, message: 'Image URL must be valid http/https URL' };
  }
  if (!data.badgeTitle || data.badgeTitle.length > 60) {
    return { ok: false, message: 'Badge title is required and must be max 60 characters' };
  }
  if (!data.badgeText || data.badgeText.length > 120) {
    return { ok: false, message: 'Badge text is required and must be max 120 characters' };
  }
  if (!data.points.length) {
    return { ok: false, message: 'At least one feature point is required' };
  }
  if (data.points.some((point) => point.title.length > 80 || point.description.length > 300)) {
    return { ok: false, message: 'Point title/description is too long' };
  }

  if (
    scriptTagRegex.test(data.sectionTag) ||
    scriptTagRegex.test(data.heading) ||
    scriptTagRegex.test(data.description) ||
    scriptTagRegex.test(data.badgeTitle) ||
    scriptTagRegex.test(data.badgeText) ||
    data.points.some((point) => scriptTagRegex.test(point.title) || scriptTagRegex.test(point.description))
  ) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  return { ok: true, data };
};

const getAdminWhyChooseUs = async (req, res) => {
  try {
    const record = await WhyChooseUs.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: record ? { ...defaultData, ...record } : defaultData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Why Choose Us content',
      error: error.message,
    });
  }
};

const getPublicWhyChooseUs = async (req, res) => {
  try {
    const record = await WhyChooseUs.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: record ? { ...defaultData, ...record } : defaultData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Why Choose Us content',
      error: error.message,
    });
  }
};

const updateAdminWhyChooseUs = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await WhyChooseUs.findOne({ singletonKey: 'global' }).lean();
    const updated = await WhyChooseUs.findOneAndUpdate(
      { singletonKey: 'global' },
      { ...validation.data, singletonKey: 'global' },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (existing?.imageUrl && existing.imageUrl !== validation.data.imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Why Choose Us content updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update Why Choose Us content',
      error: error.message,
    });
  }
};

const uploadWhyChooseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 900 || height < 600) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 900x600',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/why-choose/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Why Choose Us image uploaded successfully',
      data: { imageUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminWhyChooseUs,
  getPublicWhyChooseUs,
  updateAdminWhyChooseUs,
  uploadWhyChooseImage,
};
