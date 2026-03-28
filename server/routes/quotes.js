const express = require('express');
const Quote = require('../models/Quote');
const { adminAuth } = require('../middleware/auth');
const { sendQuoteNotificationToAdmin, sendQuoteConfirmationToCustomer } = require('../utils/email');

const router = express.Router();

// Submit a quote request (public — no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, location, details } = req.body;

    if (!name || !email || !eventType || !eventDate || !guestCount || !location) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const quote = await Quote.create({
      name, email, phone, eventType, eventDate, guestCount, location, details
    });

    // Send email notifications (non-blocking — don't fail the request if emails fail)
    sendQuoteNotificationToAdmin(quote);
    sendQuoteConfirmationToCustomer(quote);

    res.status(201).json({ message: 'Quote request submitted successfully! We\'ll be in touch soon.', quote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all quote requests (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const quotes = await Quote.find(filter).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quote status/notes (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const quote = await Quote.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quote (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
