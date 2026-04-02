const express = require('express');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const { upload, uploadToGCS, deleteFromGCS } = require('../middleware/gcsUpload');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (admin)
router.post('/', adminAuth, upload.single('image'), uploadToGCS('products'), async (req, res) => {
  try {
    const { name, description, price, category, tags, available, featured } = req.body;
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      tags: tags ? JSON.parse(tags) : [],
      available: available !== 'false',
      featured: featured === 'true',
      image: req.file?.gcsUrl || '',
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (admin)
router.put('/:id', adminAuth, upload.single('image'), uploadToGCS('products'), async (req, res) => {
  try {
    const { name, description, price, category, tags, available, featured } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (tags) updateData.tags = JSON.parse(tags);
    if (available !== undefined) updateData.available = available === 'true';
    if (featured !== undefined) updateData.featured = featured === 'true';

    if (req.file?.gcsUrl) {
      const existing = await Product.findById(req.params.id);
      if (existing?.image) await deleteFromGCS(existing.image);
      updateData.image = req.file.gcsUrl;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
