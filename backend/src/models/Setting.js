const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    websiteName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    callNumber: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    businessHours: {
      type: String,
      required: true,
      trim: true,
    },
    officeLocationName: {
      type: String,
      default: '',
      trim: true,
    },
    officeLat: {
      type: Number,
      default: null,
    },
    officeLng: {
      type: Number,
      default: null,
    },
    mapEmbedUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Setting', settingSchema);
