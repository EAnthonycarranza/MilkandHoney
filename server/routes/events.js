const express = require('express');
const Event = require('../models/Event');
const { adminAuth } = require('../middleware/auth');
const { upload, uploadToGCS, deleteFromGCS } = require('../middleware/gcsUpload');

const router = express.Router();

// Get all published events (public)
router.get('/', async (req, res) => {
  try {
    const filter = { published: true };
    const events = await Event.find(filter).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events including unpublished (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event (admin)
router.post('/', adminAuth, upload.single('image'), uploadToGCS('events'), async (req, res) => {
  try {
    const { title, description, date, time, location, eventType, featured, published } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      time: time || '',
      location,
      eventType: eventType || 'other',
      featured: featured === 'true',
      published: published !== 'false',
      image: req.file?.gcsUrl || '',
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (admin)
router.put('/:id', adminAuth, upload.single('image'), uploadToGCS('events'), async (req, res) => {
  try {
    const { title, description, date, time, location, eventType, featured, published } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (location) updateData.location = location;
    if (eventType) updateData.eventType = eventType;
    if (featured !== undefined) updateData.featured = featured === 'true';
    if (published !== undefined) updateData.published = published === 'true';

    if (req.file?.gcsUrl) {
      const existing = await Event.findById(req.params.id);
      if (existing?.image) await deleteFromGCS(existing.image);
      updateData.image = req.file.gcsUrl;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.image) await deleteFromGCS(event.image);
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
