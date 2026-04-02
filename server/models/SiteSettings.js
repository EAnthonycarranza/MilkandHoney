const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  instagramAccessToken: { type: String, default: '' },
  instagramUserId: { type: String, default: '' },
  businessEmail: { type: String, default: 'milkandhoneycoffeecart@gmail.com' },
  businessPhone: { type: String, default: '' },
  businessAddress: { type: String, default: 'San Antonio, TX' },
  instagramHandle: { type: String, default: 'milkandhoneycoffeecart' },
  showPricing: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
