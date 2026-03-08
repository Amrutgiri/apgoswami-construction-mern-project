const mongoose = require('mongoose');

const whyChoosePointSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    iconKey: { type: String, required: true, trim: true, default: 'icon-1' },
    sortOrder: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const whyChooseUsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    sectionTag: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '', trim: true },
    badgeTitle: { type: String, required: true, trim: true },
    badgeText: { type: String, required: true, trim: true },
    points: { type: [whyChoosePointSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('WhyChooseUs', whyChooseUsSchema);
