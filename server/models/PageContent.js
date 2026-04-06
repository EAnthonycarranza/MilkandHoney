const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true, enum: ['home', 'about', 'menu'] },
  hero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    imageDark: { type: String, default: '' },
    verse: { type: String, default: '' }
  },
  sections: [{
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    imageDark: { type: String, default: '' },
    order: { type: Number, default: 0 }
  }],
  instagramPosts: [{
    url: { type: String, default: '' },
    caption: { type: String, default: '' }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PageContent', pageContentSchema);
