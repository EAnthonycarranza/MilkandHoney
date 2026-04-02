const express = require('express');
const User = require('../models/User');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const newQuotes = await Quote.countDocuments({ status: 'new' });
    const bookedQuotes = await Quote.countDocuments({ status: 'booked' });
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalEvents = await Event.countDocuments();
    const totalGallery = await Gallery.countDocuments();

    const recentQuotes = await Quote.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalQuotes,
      newQuotes,
      bookedQuotes,
      totalProducts,
      totalUsers,
      totalEvents,
      totalGallery,
      recentQuotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
