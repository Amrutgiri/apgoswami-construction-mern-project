const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    sectionTag: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    paragraph1: { type: String, required: true, trim: true },
    paragraph2: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '', trim: true },
    badgeTitle: { type: String, required: true, trim: true },
    badgeText: { type: String, required: true, trim: true },
    stat1Value: { type: String, required: true, trim: true },
    stat1Label: { type: String, required: true, trim: true },
    stat2Value: { type: String, required: true, trim: true },
    stat2Label: { type: String, required: true, trim: true },
    stat3Value: { type: String, required: true, trim: true },
    stat3Label: { type: String, required: true, trim: true },
    highlight1Title: { type: String, required: true, trim: true },
    highlight1Text: { type: String, required: true, trim: true },
    highlight2Title: { type: String, required: true, trim: true },
    highlight2Text: { type: String, required: true, trim: true },
    highlight3Title: { type: String, required: true, trim: true },
    highlight3Text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AboutSection', aboutSectionSchema);
