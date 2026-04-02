const express = require('express');
const PageContent = require('../models/PageContent');
const { adminAuth } = require('../middleware/auth');
const { upload, uploadToGCS } = require('../middleware/gcsUpload');

const router = express.Router();

// Get page content (public)
router.get('/:page', async (req, res) => {
  try {
    let content = await PageContent.findOne({ page: req.params.page });

    // Return defaults if page doesn't exist yet
    if (!content) {
      const defaults = getDefaultContent(req.params.page);
      if (!defaults) return res.status(404).json({ message: 'Page not found' });
      content = await PageContent.create(defaults);
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update page content (admin)
router.put('/:page', adminAuth, upload.single('image'), uploadToGCS('pages'), async (req, res) => {
  try {
    const { hero, sections, instagramPosts } = req.body;
    const updateData = { updatedAt: Date.now() };

    if (hero) updateData.hero = JSON.parse(hero);
    if (sections) updateData.sections = JSON.parse(sections);
    if (instagramPosts) updateData.instagramPosts = JSON.parse(instagramPosts);
    if (req.file?.gcsUrl) {
      if (!updateData.hero) {
        const existing = await PageContent.findOne({ page: req.params.page });
        updateData.hero = existing?.hero || {};
      }
      updateData.hero.image = req.file.gcsUrl;
    }

    const content = await PageContent.findOneAndUpdate(
      { page: req.params.page },
      updateData,
      { new: true, upsert: true }
    );

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload section image (admin)
router.post('/upload-image', adminAuth, upload.single('image'), uploadToGCS('pages'), async (req, res) => {
  try {
    if (!req.file?.gcsUrl) return res.status(400).json({ message: 'No image uploaded' });
    res.json({ imageUrl: req.file.gcsUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getDefaultContent(page) {
  const defaults = {
    home: {
      page: 'home',
      hero: {
        title: 'Milk & Honey Coffee Cart',
        subtitle: 'He brought us to this place and gave us this land flowing with milk & honey',
        verse: 'Deuteronomy 26:9',
        image: ''
      },
      sections: [
        {
          title: 'Welcome to Milk & Honey',
          content: 'We are a faith-based mobile coffee cart serving the San Antonio community with love, one cup at a time. Every drink we craft is made with prayer and purpose.',
          image: '',
          order: 0
        },
        {
          title: 'Our Mission',
          content: 'To serve our community with excellence while sharing the love of Christ. We believe every cup of coffee is an opportunity to pour into someone\'s life.',
          image: '',
          order: 1
        }
      ],
      instagramPosts: []
    },
    about: {
      page: 'about',
      hero: {
        title: 'Our Story',
        subtitle: 'Rooted in faith, brewed with love',
        verse: '"Your mindset is the engine. Your faith is the fuel. Start showing up."',
        image: ''
      },
      sections: [
        {
          title: 'Who We Are',
          content: 'Milk & Honey Coffee Cart is a Christian-based coffee company in San Antonio, Texas. We believe that God brought us to this place and gave us this land flowing with milk and honey. Our mission is to serve the community not just with great coffee, but with the love and grace of Jesus Christ.',
          image: '',
          order: 0
        },
        {
          title: 'Our Faith',
          content: 'We want to need Jesus the way people need coffee — like we can\'t get through the day without Him. Every cup we serve is an opportunity to share His love, offer encouragement, and build community. We don\'t just make drinks; we make connections that matter.',
          image: '',
          order: 1
        },
        {
          title: 'Book Us',
          content: 'We bring the coffee cart to you! Whether it\'s a church event, wedding, corporate gathering, or community celebration, Milk & Honey Coffee Cart is here to serve. DM us on Instagram or contact us to book your next event.',
          image: '',
          order: 2
        }
      ]
    },
    menu: {
      page: 'menu',
      hero: {
        title: 'Our Menu',
        subtitle: 'Crafted with care, served with love',
        verse: '"Taste and see that the Lord is good" - Psalm 34:8',
        image: ''
      },
      sections: []
    }
  };
  return defaults[page] || null;
}

module.exports = router;
