const ContactPageContent = require('../models/ContactPageContent');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const sanitize = (value) => String(value ?? '').trim();

const defaultData = {
  heroPreHeading: 'Get In Touch',
  heroHeading: 'Contact Us',
  heroText: "We're here to answer any questions you may have about our services.",
  formSectionTag: 'Send A Message',
  formHeading: "Let's Discuss Your Project Requirements",
  formDescription:
    'Fill out the form and our team will connect with you with the right construction solution.',
  callCardSubtitle: 'Mon - Sat, 9:00 AM - 7:00 PM',
  emailCardSubtitle: 'Response within 24 hours',
  addressCardSubtitle: 'Gujarat, India',
  mapTitle: 'Office Location',
  mapSubtitle: 'Our office location map',
  quickQuestions: [
    'Do you handle complete turnkey projects?',
    'Can you share timeline and cost estimate before start?',
    'Do you provide post-handover support?',
  ],
  serviceOptions: [
    'Residential Construction',
    'Commercial Projects',
    'Renovation & Remodeling',
    'Turnkey Solutions',
  ],
};

const validatePayload = (payload) => {
  const quickQuestions = Array.isArray(payload.quickQuestions)
    ? payload.quickQuestions.map((item) => sanitize(item)).filter(Boolean)
    : [];
  const serviceOptions = Array.isArray(payload.serviceOptions)
    ? payload.serviceOptions.map((item) => sanitize(item)).filter(Boolean)
    : [];

  const data = {
    heroPreHeading: sanitize(payload.heroPreHeading),
    heroHeading: sanitize(payload.heroHeading),
    heroText: sanitize(payload.heroText),
    formSectionTag: sanitize(payload.formSectionTag),
    formHeading: sanitize(payload.formHeading),
    formDescription: sanitize(payload.formDescription),
    callCardSubtitle: sanitize(payload.callCardSubtitle),
    emailCardSubtitle: sanitize(payload.emailCardSubtitle),
    addressCardSubtitle: sanitize(payload.addressCardSubtitle),
    mapTitle: sanitize(payload.mapTitle),
    mapSubtitle: sanitize(payload.mapSubtitle),
    quickQuestions,
    serviceOptions,
  };

  const requiredChecks = [
    ['heroPreHeading', 60],
    ['heroHeading', 120],
    ['heroText', 250],
    ['formSectionTag', 60],
    ['formHeading', 160],
    ['formDescription', 300],
    ['callCardSubtitle', 120],
    ['emailCardSubtitle', 120],
    ['addressCardSubtitle', 120],
    ['mapTitle', 80],
    ['mapSubtitle', 160],
  ];

  for (const [field, max] of requiredChecks) {
    if (!data[field] || data[field].length > max) {
      return { ok: false, message: `${field} is required and must be max ${max} characters` };
    }
    if (scriptTagRegex.test(data[field])) {
      return { ok: false, message: 'Scripting tags are not allowed' };
    }
  }

  if (!data.quickQuestions.length || data.quickQuestions.length > 10) {
    return { ok: false, message: 'Quick questions must be between 1 and 10 items' };
  }
  if (!data.serviceOptions.length || data.serviceOptions.length > 12) {
    return { ok: false, message: 'Service options must be between 1 and 12 items' };
  }
  if (
    data.quickQuestions.some((item) => item.length > 160 || scriptTagRegex.test(item)) ||
    data.serviceOptions.some((item) => item.length > 80 || scriptTagRegex.test(item))
  ) {
    return { ok: false, message: 'Invalid quick questions/service options values' };
  }

  return { ok: true, data };
};

const getAdminContactPageContent = async (req, res) => {
  try {
    const content = await ContactPageContent.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: content ? { ...defaultData, ...content } : defaultData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact page content',
      error: error.message,
    });
  }
};

const getPublicContactPageContent = async (req, res) => {
  try {
    const content = await ContactPageContent.findOne({ singletonKey: 'global' }).lean();
    return res.status(200).json({
      success: true,
      data: content ? { ...defaultData, ...content } : defaultData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact page content',
      error: error.message,
    });
  }
};

const updateAdminContactPageContent = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const updated = await ContactPageContent.findOneAndUpdate(
      { singletonKey: 'global' },
      { ...validation.data, singletonKey: 'global' },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Contact page content updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact page content',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminContactPageContent,
  getPublicContactPageContent,
  updateAdminContactPageContent,
};
