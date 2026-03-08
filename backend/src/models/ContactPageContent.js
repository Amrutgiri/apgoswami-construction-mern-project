const mongoose = require('mongoose');

const contactPageContentSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    heroPreHeading: { type: String, required: true, trim: true },
    heroHeading: { type: String, required: true, trim: true },
    heroText: { type: String, required: true, trim: true },
    formSectionTag: { type: String, required: true, trim: true },
    formHeading: { type: String, required: true, trim: true },
    formDescription: { type: String, required: true, trim: true },
    callCardSubtitle: { type: String, required: true, trim: true },
    emailCardSubtitle: { type: String, required: true, trim: true },
    addressCardSubtitle: { type: String, required: true, trim: true },
    mapTitle: { type: String, required: true, trim: true },
    mapSubtitle: { type: String, required: true, trim: true },
    quickQuestions: [{ type: String, trim: true }],
    serviceOptions: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('ContactPageContent', contactPageContentSchema);
