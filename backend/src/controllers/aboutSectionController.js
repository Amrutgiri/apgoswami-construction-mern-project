const fs = require('fs');
const sharp = require('sharp');
const AboutSection = require('../models/AboutSection');

const defaultAboutSection = {
  sectionTag: 'About Us',
  heading: 'Your Trusted Construction Partner',
  paragraph1:
    'Somnath Construction is built on trust, quality workmanship, and long-term client relationships. We focus on creating safe and durable spaces that add real value.',
  paragraph2:
    'From planning to final handover, our team maintains clear communication, honest timelines, and strong engineering standards in every stage of work.',
  imageUrl: '',
  badgeTitle: 'Trusted By 500+ Clients',
  badgeText: 'Reliable quality with transparent delivery.',
  stat1Value: '120+',
  stat1Label: 'Projects Completed',
  stat2Value: '15+',
  stat2Label: 'Years Experience',
  stat3Value: '98%',
  stat3Label: 'On-Time Delivery',
  highlight1Title: 'Our Mission',
  highlight1Text:
    'To deliver dependable construction solutions with a strong focus on quality, safety, and client satisfaction.',
  highlight2Title: 'Our Vision',
  highlight2Text:
    'To be recognized as a trusted construction brand known for transparency, innovation, and lasting structures.',
  highlight3Title: 'Our Commitment',
  highlight3Text:
    'We are committed to timely delivery, ethical work, and consistent quality in every project we undertake.',
};

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsAboutSegment = '/uploads/about/';

const sanitize = (value) => String(value ?? '').trim();
const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return;
    }
    if (!imageUrl.includes(uploadsAboutSegment)) {
      return;
    }

    const fileName = imageUrl.split(uploadsAboutSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }

    const filePath = `uploads/about/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore file cleanup failures to avoid blocking content update.
  }
};

const validatePayload = (payload) => {
  const data = {
    sectionTag: sanitize(payload.sectionTag),
    heading: sanitize(payload.heading),
    paragraph1: sanitize(payload.paragraph1),
    paragraph2: sanitize(payload.paragraph2),
    imageUrl: sanitize(payload.imageUrl),
    badgeTitle: sanitize(payload.badgeTitle),
    badgeText: sanitize(payload.badgeText),
    stat1Value: sanitize(payload.stat1Value),
    stat1Label: sanitize(payload.stat1Label),
    stat2Value: sanitize(payload.stat2Value),
    stat2Label: sanitize(payload.stat2Label),
    stat3Value: sanitize(payload.stat3Value),
    stat3Label: sanitize(payload.stat3Label),
    highlight1Title: sanitize(payload.highlight1Title),
    highlight1Text: sanitize(payload.highlight1Text),
    highlight2Title: sanitize(payload.highlight2Title),
    highlight2Text: sanitize(payload.highlight2Text),
    highlight3Title: sanitize(payload.highlight3Title),
    highlight3Text: sanitize(payload.highlight3Text),
  };

  const requiredFields = [
    'sectionTag',
    'heading',
    'paragraph1',
    'paragraph2',
    'badgeTitle',
    'badgeText',
    'stat1Value',
    'stat1Label',
    'stat2Value',
    'stat2Label',
    'stat3Value',
    'stat3Label',
    'highlight1Title',
    'highlight1Text',
    'highlight2Title',
    'highlight2Text',
    'highlight3Title',
    'highlight3Text',
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return { ok: false, message: `${field} is required` };
    }
    if (scriptTagRegex.test(data[field])) {
      return { ok: false, message: 'Scripting tags are not allowed' };
    }
  }

  if (data.imageUrl && !/^https?:\/\/.+/i.test(data.imageUrl)) {
    return { ok: false, message: 'Image URL must be a valid http/https URL' };
  }

  return { ok: true, data };
};

const getAdminAboutSection = async (req, res) => {
  try {
    const about = await AboutSection.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: about ? { ...defaultAboutSection, ...about } : defaultAboutSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch about section',
      error: error.message,
    });
  }
};

const updateAdminAboutSection = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await AboutSection.findOne({ singletonKey: 'global' }).lean();

    const updated = await AboutSection.findOneAndUpdate(
      { singletonKey: 'global' },
      { ...validation.data, singletonKey: 'global' },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (existing?.imageUrl && existing.imageUrl !== validation.data.imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'About section updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update about section',
      error: error.message,
    });
  }
};

const getPublicAboutSection = async (req, res) => {
  try {
    const about = await AboutSection.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: about ? { ...defaultAboutSection, ...about } : defaultAboutSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch about section',
      error: error.message,
    });
  }
};

const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'About image file is required' });
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
    const imageUrl = `${baseUrl}/uploads/about/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'About image uploaded successfully',
      data: { imageUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload about image',
      error: error.message,
    });
  }
};

const updateAboutImageOnly = async (req, res) => {
  try {
    const imageUrl = String(req.body.imageUrl ?? '').trim();
    if (!imageUrl || !/^https?:\/\/.+/i.test(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid http/https URL',
      });
    }

    const existing = await AboutSection.findOne({ singletonKey: 'global' }).lean();
    const payload = existing
      ? { ...existing, imageUrl }
      : { ...defaultAboutSection, imageUrl, singletonKey: 'global' };

    const updated = await AboutSection.findOneAndUpdate(
      { singletonKey: 'global' },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'About image updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update about image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminAboutSection,
  updateAdminAboutSection,
  getPublicAboutSection,
  uploadAboutImage,
  updateAboutImageOnly,
};
