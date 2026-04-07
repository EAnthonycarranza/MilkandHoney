const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, default: '' },
  location: { type: String, required: true },
  locationName: { type: String, default: '' },
  image: { type: String, default: '' },
  eventType: {
    type: String,
    enum: ['wedding', 'church', 'corporate', 'birthday', 'community', 'fundraiser', 'pop-up', 'other'],
    default: 'other',
  },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);
