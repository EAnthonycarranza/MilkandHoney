const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, required: true, enum: ['hot-coffee', 'iced-coffee', 'specialty', 'non-coffee', 'pastry'] },
  tags: [{ type: String, trim: true }],
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
