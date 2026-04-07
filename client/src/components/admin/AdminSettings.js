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

  // Password reset state
  const [passwordForm, setPasswordResetForm] = useState({
    currentPassword: '',
    confirmCurrentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  const [resettingPassword, setPasswordResetting] = useState(false);

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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (passwordForm.currentPassword !== passwordForm.confirmCurrentPassword) {
      return setPasswordMessage({ text: 'Current passwords do not match', type: 'error' });
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMessage({ text: 'New passwords do not match', type: 'error' });
    }

    if (passwordForm.newPassword.length < 8) {
      return setPasswordMessage({ text: 'New password must be at least 8 characters long', type: 'error' });
    }

    // Password strength check (simplified)
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!strongRegex.test(passwordForm.newPassword)) {
      return setPasswordMessage({ 
        text: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 
        type: 'error' 
      });
    }

    setPasswordResetting(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage({ text: 'Password updated successfully!', type: 'success' });
      setPasswordResetForm({ currentPassword: '', confirmCurrentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({ 
        text: err.response?.data?.message || 'Failed to update password', 
        type: 'error' 
      });
    } finally {
      setPasswordResetting(false);
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

        {/* Password Reset Section */}
        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--cream-dark)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--gold-dark)' }}>Account Password</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>
            Update your admin account password. Ensure you use a strong, unique password.
          </p>
          
          {passwordMessage.text && (
            <div className={`alert alert-${passwordMessage.type}`} style={{ marginBottom: '1.5rem' }}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordReset}>
            <div className="admin-form" style={{ padding: 0, boxShadow: 'none' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={e => setPasswordResetForm({ ...passwordForm, currentPassword: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmCurrentPassword} 
                    onChange={e => setPasswordResetForm({ ...passwordForm, confirmCurrentPassword: e.target.value })} 
                    required 
                  />
                </div>
              </div>
            </div>
            <div className="admin-form" style={{ padding: 0, boxShadow: 'none', marginTop: '1rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={e => setPasswordResetForm({ ...passwordForm, newPassword: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword} 
                    onChange={e => setPasswordResetForm({ ...passwordForm, confirmPassword: e.target.value })} 
                    required 
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-outline" disabled={resettingPassword}>
                {resettingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Menu Display */}
        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--cream-dark)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--gold-dark)' }}>Menu Display</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Control how your menu appears to visitors. Since Milk &amp; Honey is currently a coffee cart service,
            pricing is hidden by default. When you open a standalone location, enable pricing to show prices on the public menu.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: 'var(--cream)', borderRadius: 12 }}>
            <input
              type="checkbox"
              checked={settings.showPricing || false}
              onChange={e => setSettings({ ...settings, showPricing: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: 'var(--gold-dark)' }}
            />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Show pricing on public menu</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                {settings.showPricing ? 'Prices are visible to all visitors' : 'Prices are hidden from visitors (coffee cart mode)'}
              </span>
            </div>
          </label>
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
