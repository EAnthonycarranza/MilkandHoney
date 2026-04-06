const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, required: true, enum: ['hot-coffee', 'iced-coffee', 'specialty', 'non-coffee', 'pastry', 'signature-latte', 'original-latte', 'add-on', 'milk-option'] },
  milkOptions: [{ type: String, trim: true }],
  subItems: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
