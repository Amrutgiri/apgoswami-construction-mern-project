const mongoose = require('mongoose');

const homeHeroSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    preHeading: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    subHeading: {
      type: String,
      required: true,
      trim: true,
    },
    heroImage: {
      type: String,
      required: true,
      trim: true,
    },
    primaryButtonText: {
      type: String,
      required: true,
      trim: true,
    },
    primaryButtonLink: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryButtonLink: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('HomeHero', homeHeroSchema);
