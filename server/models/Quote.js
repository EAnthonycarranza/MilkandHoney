const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  eventType: {
    type: String,
    required: true,
    enum: ['wedding', 'church', 'corporate', 'birthday', 'community', 'fundraiser', 'other']
  },
  eventDate: { type: String, required: true },
  guestCount: { type: String, required: true },
  location: { type: String, required: true },
  details: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'booked', 'declined'],
    default: 'new'
  },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', quoteSchema);
