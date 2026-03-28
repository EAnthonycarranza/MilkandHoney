const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get public settings (no tokens exposed)
router.get('/public', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({
      businessEmail: settings.businessEmail,
      businessPhone: settings.businessPhone,
      businessAddress: settings.businessAddress,
      instagramHandle: settings.instagramHandle,
      hasInstagramToken: !!settings.instagramAccessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all settings (admin — includes token info)
router.get('/', adminAuth, async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({
      ...settings.toObject(),
      instagramAccessToken: settings.instagramAccessToken ? '••••••' + settings.instagramAccessToken.slice(-8) : ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { businessEmail, businessPhone, businessAddress, instagramHandle, instagramAccessToken, instagramUserId } = req.body;
    const updateData = { updatedAt: Date.now() };

    if (businessEmail !== undefined) updateData.businessEmail = businessEmail;
    if (businessPhone !== undefined) updateData.businessPhone = businessPhone;
    if (businessAddress !== undefined) updateData.businessAddress = businessAddress;
    if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;
    if (instagramUserId !== undefined) updateData.instagramUserId = instagramUserId;
    // Only update token if a real new value is provided (not the masked one)
    if (instagramAccessToken && !instagramAccessToken.startsWith('••')) {
      updateData.instagramAccessToken = instagramAccessToken;
    }

    const settings = await SiteSettings.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    res.json({
      ...settings.toObject(),
      instagramAccessToken: settings.instagramAccessToken ? '••••••' + settings.instagramAccessToken.slice(-8) : ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
