const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ['events', 'menu', 'behind-the-scenes', 'setup', 'other'],
    default: 'other',
  },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Gallery', gallerySchema);
