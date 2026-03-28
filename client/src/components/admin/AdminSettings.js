import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    instagramHandle: '',
    instagramAccessToken: '',
    instagramUserId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put('/settings', settings);
      setSettings(data);
      setMessage('Settings saved successfully!');
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post('/instagram/refresh-token');
      setMessage(`Token refreshed! Expires in ${Math.round(data.expiresIn / 86400)} days.`);
    } catch (err) {
      setMessage('Failed to refresh token. You may need to generate a new one.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) return <div className="loading-spinner">Loading settings...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Site Settings</h2>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') || message.includes('refreshed') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="admin-form">
        {/* Business Info */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--gold-dark)' }}>Business Information</h3>
        <div className="form-group">
          <label>Business Email</label>
          <input type="email" value={settings.businessEmail} onChange={e => setSettings({ ...settings, businessEmail: e.target.value })} placeholder="your@business.com" />
        </div>
        <div className="form-group">
          <label>Business Phone</label>
          <input type="tel" value={settings.businessPhone} onChange={e => setSettings({ ...settings, businessPhone: e.target.value })} placeholder="(555) 123-4567" />
        </div>
        <div className="form-group">
          <label>Business Address / Location</label>
          <input type="text" value={settings.businessAddress} onChange={e => setSettings({ ...settings, businessAddress: e.target.value })} placeholder="San Antonio, TX" />
        </div>

        {/* Instagram Integration */}
        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--cream-dark)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--gold-dark)' }}>Instagram Integration</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Connect your Instagram account to display your posts on the website automatically.
            You'll need a long-lived access token from the Instagram Graph API.
          </p>

          <div className="form-group">
            <label>Instagram Handle</label>
            <input type="text" value={settings.instagramHandle} onChange={e => setSettings({ ...settings, instagramHandle: e.target.value })} placeholder="milkandhoneycoffeecart" />
          </div>
          <div className="form-group">
            <label>Instagram User ID</label>
            <input type="text" value={settings.instagramUserId || ''} onChange={e => setSettings({ ...settings, instagramUserId: e.target.value })} placeholder="Your Instagram User ID (numeric)" />
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>Found in your Facebook Developer dashboard</p>
          </div>
          <div className="form-group">
            <label>Instagram Access Token</label>
            <input type="text" value={settings.instagramAccessToken} onChange={e => setSettings({ ...settings, instagramAccessToken: e.target.value })} placeholder="Paste your long-lived access token here" />
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
              Token is stored securely and never shown in full after saving
            </p>
          </div>

          {settings.instagramAccessToken && settings.instagramAccessToken.startsWith('••') && (
            <button className="btn btn-outline btn-sm" onClick={handleRefreshToken} disabled={refreshing} style={{ marginBottom: '1rem' }}>
              {refreshing ? 'Refreshing...' : 'Refresh Token (Extend Expiry)'}
            </button>
          )}

          <div style={{ background: 'var(--cream)', padding: '1.25rem', borderRadius: 12, marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>How to get your Instagram Access Token:</h4>
            <ol style={{ fontSize: '0.85rem', color: 'var(--gray)', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
              <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dark)' }}>developers.facebook.com</a> and create an app</li>
              <li>Add "Instagram Graph API" to your app</li>
              <li>In the API setup, generate a User Token with <code>user_profile</code> and <code>user_media</code> permissions</li>
              <li>Use the Access Token Debugger to exchange for a long-lived token (60 days)</li>
              <li>Paste the long-lived token above and click "Refresh Token" periodically to extend it</li>
            </ol>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
