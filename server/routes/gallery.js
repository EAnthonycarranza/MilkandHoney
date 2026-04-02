const express = require('express');
const Gallery = require('../models/Gallery');
const { adminAuth } = require('../middleware/auth');
const { upload, uploadToGCS, uploadMultipleToGCS, deleteFromGCS } = require('../middleware/gcsUpload');

const router = express.Router();

// Get all published gallery items (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all gallery items including unpublished (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload single gallery item (admin)
router.post('/', adminAuth, upload.single('image'), uploadToGCS('gallery'), async (req, res) => {
  try {
    const { title, caption, category, order, published } = req.body;
    if (!req.file?.gcsUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }
    const item = await Gallery.create({
      title: title || '',
      caption: caption || '',
      image: req.file.gcsUrl,
      category: category || 'other',
      order: parseInt(order) || 0,
      published: published !== 'false',
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload gallery images (admin)
router.post('/bulk', adminAuth, upload.array('images', 20), uploadMultipleToGCS('gallery'), async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided or invalid file format' });
    }

    const items = await Promise.all(
      req.files.map((file, i) =>
        Gallery.create({
          image: file.gcsUrl,
          category: category || 'other',
          order: i,
          published: true,
        })
      )
    );
    res.status(201).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update gallery item (admin)
router.put('/:id', adminAuth, upload.single('image'), uploadToGCS('gallery'), async (req, res) => {
  try {
    const { title, caption, category, order, published } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (caption !== undefined) updateData.caption = caption;
    if (category) updateData.category = category;
    if (order !== undefined) updateData.order = parseInt(order);
    if (published !== undefined) updateData.published = published === 'true';

    if (req.file?.gcsUrl) {
      const existing = await Gallery.findById(req.params.id);
      if (existing?.image) await deleteFromGCS(existing.image);
      updateData.image = req.file.gcsUrl;
    }

    const item = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proxy gallery image to avoid CORS issues for cropping (admin)
router.get('/proxy-image/:id', adminAuth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item || !item.image) return res.status(404).json({ message: 'Image not found' });
    const https = require('https');
    const http = require('http');
    const client = item.image.startsWith('https') ? https : http;
    client.get(item.image, (proxyRes) => {
      res.set('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      proxyRes.pipe(res);
    }).on('error', () => res.status(500).json({ message: 'Failed to fetch image' }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gallery item (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });
    if (item.image) await deleteFromGCS(item.image);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
