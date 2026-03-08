const Inquiry = require('../models/Inquiry');

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
]);

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const fullNameRegex = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
const phoneRegex = /^\d{10}$/;

const createInquiry = async (req, res) => {
  try {
    const { fullName, email, phone, service, message } = req.body;

    if (!fullName || !email || !phone || !service || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const normalizedFullName = String(fullName).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    const normalizedService = String(service).trim();
    const normalizedMessage = String(message).trim();

    if (!fullNameRegex.test(normalizedFullName) || normalizedFullName.length < 3 || normalizedFullName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid full name',
      });
    }

    if (scriptTagRegex.test(normalizedFullName) || scriptTagRegex.test(normalizedMessage)) {
      return res.status(400).json({
        success: false,
        message: 'Scripting tags are not allowed',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    const emailDomain = normalizedEmail.split('@')[1] || '';
    if (!emailDomain || DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Disposable email addresses are not allowed',
      });
    }

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits',
      });
    }

    if (normalizedMessage.length < 10 || normalizedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 10 and 1000 characters',
      });
    }

    const inquiry = await Inquiry.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      service: normalizedService,
      message: normalizedMessage,
      status: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
      error: error.message,
    });
  }
};

const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message,
    });
  }
};

const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (![0, 1].includes(Number(status))) {
      return res.status(400).json({
        success: false,
        message: 'Status must be 0 or 1',
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status: Number(status) },
      { new: true },
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated',
      data: inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status',
      error: error.message,
    });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
};
