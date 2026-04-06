const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Cache for Instagram posts (avoid hammering the API)
let cachedPosts = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Get Instagram posts (public)
router.get('/posts', async (req, res) => {
  try {
    // Return cache if fresh
    if (cachedPosts && Date.now() - cacheTime < CACHE_DURATION) {
      return res.json(cachedPosts);
    }

    const settings = await SiteSettings.findOne();
    if (!settings?.instagramAccessToken) {
      return res.json([]);
    }

    const token = settings.instagramAccessToken;
    const userId = settings.instagramUserId || 'me';

    // Fetch from Instagram Graph API
    const url = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${token}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      return res.json(cachedPosts || []);
    }

    const data = await response.json();
    const posts = (data.data || []).map(post => ({
      id: post.id,
      caption: post.caption || '',
      mediaType: post.media_type,
      mediaUrl: post.media_url,
      thumbnailUrl: post.thumbnail_url,
      permalink: post.permalink,
      timestamp: post.timestamp
    }));

    // Update cache
    cachedPosts = posts;
    cacheTime = Date.now();

    res.json(posts);
  } catch (error) {
    console.error('Instagram fetch error:', error.message);
    res.json(cachedPosts || []);
  }
});

// Refresh token (Instagram tokens expire — this extends a long-lived token)
router.post('/refresh-token', adminAuth, async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings?.instagramAccessToken) {
      return res.status(400).json({ message: 'No access token configured' });
    }

    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${settings.instagramAccessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.access_token) {
      settings.instagramAccessToken = data.access_token;
      settings.updatedAt = Date.now();
      await settings.save();
      res.json({ message: 'Token refreshed successfully', expiresIn: data.expires_in });
    } else {
      res.status(400).json({ message: 'Failed to refresh token', error: data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
