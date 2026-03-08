const HomeHero = require('../models/HomeHero');
const sharp = require('sharp');
const fs = require('fs');

const defaultHero = {
  preHeading: 'Welcome to Somnath Construction',
  heading: 'Crafting dreams with\nquality and trust',
  subHeading: 'Building your dreams with quality and trust.',
  heroImage: '',
  primaryButtonText: 'Contact Now',
  primaryButtonLink: '/contact-us',
  secondaryButtonText: 'View Projects',
  secondaryButtonLink: '/projects',
};

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsHeroesSegment = '/uploads/heroes/';

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return;
    }
    if (!imageUrl.includes(uploadsHeroesSegment)) {
      return;
    }

    const fileName = imageUrl.split(uploadsHeroesSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }

    const filePath = `uploads/heroes/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore file cleanup failures to avoid blocking content update.
  }
};

const validateHeroPayload = (payload) => {
  const data = {
    preHeading: String(payload.preHeading ?? '').trim(),
    heading: String(payload.heading ?? '').trim(),
    subHeading: String(payload.subHeading ?? '').trim(),
    heroImage: String(payload.heroImage ?? '').trim(),
    primaryButtonText: String(payload.primaryButtonText ?? '').trim(),
    primaryButtonLink: String(payload.primaryButtonLink ?? '').trim(),
    secondaryButtonText: String(payload.secondaryButtonText ?? '').trim(),
    secondaryButtonLink: String(payload.secondaryButtonLink ?? '').trim(),
  };

  if (
    scriptTagRegex.test(data.preHeading) ||
    scriptTagRegex.test(data.heading) ||
    scriptTagRegex.test(data.subHeading) ||
    scriptTagRegex.test(data.primaryButtonText) ||
    scriptTagRegex.test(data.secondaryButtonText)
  ) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  if (!data.preHeading || data.preHeading.length > 120) {
    return { ok: false, message: 'Pre heading is required and must be max 120 characters' };
  }
  if (!data.heading || data.heading.length > 180) {
    return { ok: false, message: 'Heading is required and must be max 180 characters' };
  }
  if (!data.subHeading || data.subHeading.length > 200) {
    return { ok: false, message: 'Sub heading is required and must be max 200 characters' };
  }
  if (data.heroImage && !/^https?:\/\/.+/i.test(data.heroImage)) {
    return { ok: false, message: 'Hero image must be a valid http/https URL' };
  }
  if (!data.primaryButtonText || data.primaryButtonText.length > 40) {
    return { ok: false, message: 'Primary button text is required and must be max 40 characters' };
  }
  if (!data.secondaryButtonText || data.secondaryButtonText.length > 40) {
    return { ok: false, message: 'Secondary button text is required and must be max 40 characters' };
  }
  if (!/^\/[A-Za-z0-9/_-]*$/.test(data.primaryButtonLink)) {
    return { ok: false, message: 'Primary button link must be a valid internal route path' };
  }
  if (!/^\/[A-Za-z0-9/_-]*$/.test(data.secondaryButtonLink)) {
    return { ok: false, message: 'Secondary button link must be a valid internal route path' };
  }

  return { ok: true, data };
};

const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Hero image file is required',
      });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 1280 || height < 720) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 1280x720',
      });
    }

    const expectedRatio = 16 / 9;
    const actualRatio = width / height;
    const ratioDiff = Math.abs(actualRatio - expectedRatio);
    if (ratioDiff > 0.03) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image must be in 16:9 aspect ratio',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/heroes/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Hero image uploaded successfully',
      data: {
        imageUrl,
        width,
        height,
      },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload hero image',
      error: error.message,
    });
  }
};

const getAdminHero = async (req, res) => {
  try {
    const hero = await HomeHero.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: hero
        ? {
            preHeading: hero.preHeading,
            heading: hero.heading,
            subHeading: hero.subHeading,
            heroImage: hero.heroImage || '',
            primaryButtonText: hero.primaryButtonText,
            primaryButtonLink: hero.primaryButtonLink,
            secondaryButtonText: hero.secondaryButtonText,
            secondaryButtonLink: hero.secondaryButtonLink,
            updatedAt: hero.updatedAt,
          }
        : defaultHero,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch home hero content',
      error: error.message,
    });
  }
};

const updateAdminHero = async (req, res) => {
  try {
    const validation = validateHeroPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const existingHero = await HomeHero.findOne({ singletonKey: 'global' }).lean();

    const updatedHero = await HomeHero.findOneAndUpdate(
      { singletonKey: 'global' },
      { ...validation.data, singletonKey: 'global' },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (existingHero?.heroImage && existingHero.heroImage !== validation.data.heroImage) {
      safeDeleteLocalImageByUrl(existingHero.heroImage);
    }

    return res.status(200).json({
      success: true,
      message: 'Home hero updated successfully',
      data: updatedHero,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update home hero content',
      error: error.message,
    });
  }
};

const getPublicHero = async (req, res) => {
  try {
    const hero = await HomeHero.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: hero
        ? {
            preHeading: hero.preHeading,
            heading: hero.heading,
            subHeading: hero.subHeading,
            heroImage: hero.heroImage || '',
            primaryButtonText: hero.primaryButtonText,
            primaryButtonLink: hero.primaryButtonLink,
            secondaryButtonText: hero.secondaryButtonText,
            secondaryButtonLink: hero.secondaryButtonLink,
            updatedAt: hero.updatedAt,
          }
        : defaultHero,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch home hero content',
      error: error.message,
    });
  }
};

const updateHeroImageOnly = async (req, res) => {
  try {
    const heroImage = String(req.body.heroImage ?? '').trim();

    if (!heroImage || !/^https?:\/\/.+/i.test(heroImage)) {
      return res.status(400).json({
        success: false,
        message: 'Hero image must be a valid http/https URL',
      });
    }

    const existing = await HomeHero.findOne({ singletonKey: 'global' }).lean();

    const payload = existing
      ? {
          ...existing,
          heroImage,
        }
      : {
          ...defaultHero,
          heroImage,
          singletonKey: 'global',
        };

    const updatedHero = await HomeHero.findOneAndUpdate(
      { singletonKey: 'global' },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    if (existing?.heroImage && existing.heroImage !== heroImage) {
      safeDeleteLocalImageByUrl(existing.heroImage);
    }

    return res.status(200).json({
      success: true,
      message: 'Hero image updated successfully',
      data: updatedHero,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update hero image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminHero,
  updateAdminHero,
  getPublicHero,
  uploadHeroImage,
  updateHeroImageOnly,
};
