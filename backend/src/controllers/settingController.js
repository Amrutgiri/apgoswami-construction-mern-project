const Setting = require('../models/Setting');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const sanitizeString = (value) => String(value ?? '').trim();

const validatePayload = (payload) => {
  const data = {
    websiteName: sanitizeString(payload.websiteName),
    email: sanitizeString(payload.email).toLowerCase(),
    callNumber: sanitizeString(payload.callNumber),
    whatsappNumber: sanitizeString(payload.whatsappNumber),
    fullAddress: sanitizeString(payload.fullAddress),
    description: sanitizeString(payload.description),
    businessHours: sanitizeString(payload.businessHours),
    officeLocationName: sanitizeString(payload.officeLocationName),
    mapEmbedUrl: sanitizeString(payload.mapEmbedUrl),
    officeLat:
      payload.officeLat === '' || payload.officeLat === undefined || payload.officeLat === null
        ? null
        : Number(payload.officeLat),
    officeLng:
      payload.officeLng === '' || payload.officeLng === undefined || payload.officeLng === null
        ? null
        : Number(payload.officeLng),
  };

  if (data.websiteName.length < 2 || data.websiteName.length > 80) {
    return { ok: false, message: 'Website name must be between 2 and 80 characters' };
  }

  if (!emailRegex.test(data.email)) {
    return { ok: false, message: 'Please enter a valid email address' };
  }

  if (!phoneRegex.test(data.callNumber) || !phoneRegex.test(data.whatsappNumber)) {
    return { ok: false, message: 'Call and WhatsApp numbers must be exactly 10 digits' };
  }

  if (data.fullAddress.length < 8 || data.fullAddress.length > 250) {
    return { ok: false, message: 'Full address must be between 8 and 250 characters' };
  }

  if (!data.description || data.description.length > 150) {
    return { ok: false, message: 'Description is required and must be max 150 characters' };
  }

  if (!data.businessHours || data.businessHours.length > 300) {
    return { ok: false, message: 'Business hours are required and must be max 300 characters' };
  }

  if (data.officeLat !== null && (Number.isNaN(data.officeLat) || data.officeLat < -90 || data.officeLat > 90)) {
    return { ok: false, message: 'Latitude must be between -90 and 90' };
  }

  if (
    data.officeLng !== null &&
    (Number.isNaN(data.officeLng) || data.officeLng < -180 || data.officeLng > 180)
  ) {
    return { ok: false, message: 'Longitude must be between -180 and 180' };
  }

  if (data.mapEmbedUrl && !/^https?:\/\/.+/i.test(data.mapEmbedUrl)) {
    return { ok: false, message: 'Map URL must be a valid http/https link' };
  }

  return { ok: true, data };
};

const defaultSettingsResponse = {
  websiteName: '',
  email: '',
  callNumber: '',
  whatsappNumber: '',
  fullAddress: '',
  description: '',
  businessHours: '',
  officeLocationName: '',
  officeLat: null,
  officeLng: null,
  mapEmbedUrl: '',
};

const getAdminSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne({ singletonKey: 'global' }).lean();

    return res.status(200).json({
      success: true,
      data: setting
        ? {
            websiteName: setting.websiteName,
            email: setting.email,
            callNumber: setting.callNumber,
            whatsappNumber: setting.whatsappNumber,
            fullAddress: setting.fullAddress,
            description: setting.description,
            businessHours: setting.businessHours,
            officeLocationName: setting.officeLocationName || '',
            officeLat: setting.officeLat ?? null,
            officeLng: setting.officeLng ?? null,
            mapEmbedUrl: setting.mapEmbedUrl || '',
          }
        : defaultSettingsResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

const upsertSettings = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const updatedSetting = await Setting.findOneAndUpdate(
      { singletonKey: 'global' },
      { ...validation.data, singletonKey: 'global' },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSetting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne({ singletonKey: 'global' }).lean();

    return res.status(200).json({
      success: true,
      data: setting
        ? {
            websiteName: setting.websiteName,
            email: setting.email,
            callNumber: setting.callNumber,
            whatsappNumber: setting.whatsappNumber,
            fullAddress: setting.fullAddress,
            description: setting.description,
            businessHours: setting.businessHours,
            officeLocationName: setting.officeLocationName || '',
            officeLat: setting.officeLat ?? null,
            officeLng: setting.officeLng ?? null,
            mapEmbedUrl: setting.mapEmbedUrl || '',
          }
        : defaultSettingsResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public settings',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminSettings,
  upsertSettings,
  getPublicSettings,
};
