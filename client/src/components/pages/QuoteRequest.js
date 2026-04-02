import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'church', label: 'Church Event' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'birthday', label: 'Birthday / Party' },
  { value: 'community', label: 'Community Event' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'other', label: 'Other' }
];

const QuoteRequest = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', location: '', details: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/public').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/quotes', form);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\u2615'}</div>
          <h2>Quote Request Sent!</h2>
          <p className="auth-subtitle">
            "The Lord bless you and keep you" - Numbers 6:24
          </p>
          <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Thank you for your interest in Milk & Honey Coffee Cart!
            We've received your request and will get back to you within 24-48 hours
            with a personalized quote for your event.
          </p>
          {settings?.businessEmail && (
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
              Questions? Email us at{' '}
              <a href={`mailto:${settings.businessEmail}`} style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
                {settings.businessEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Get a Free Quote</h1>
          <p className="subtitle">Tell us about your event and we'll create a custom package for you</p>
          <p className="verse">"For I know the plans I have for you" - Jeremiah 29:11</p>
        </div>
      </section>

      <div className="section">
        <div className="checkout-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ background: 'var(--cream)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--gold-dark)', marginBottom: '0.5rem' }}>How It Works</h3>
            <div className="how-it-works">
              <div className="step">
                <span className="step-number">1</span>
                <p>Fill out the form below with your event details</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>We'll review and send you a personalized quote</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Confirm your booking and we'll handle the rest!</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label>Event Type *</label>
              <select name="eventType" value={form.eventType} onChange={handleChange} required>
                <option value="">Select event type...</option>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Event Date *</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Estimated Guest Count *</label>
              <select name="guestCount" value={form.guestCount} onChange={handleChange} required>
                <option value="">Select guest count...</option>
                <option value="1-25">1 - 25 guests</option>
                <option value="26-50">26 - 50 guests</option>
                <option value="51-100">51 - 100 guests</option>
                <option value="101-200">101 - 200 guests</option>
                <option value="200+">200+ guests</option>
              </select>
            </div>
            <div className="form-group">
              <label>Event Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} required placeholder="Venue name or address" />
            </div>
            <div className="form-group">
              <label>Additional Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us more about your event — theme, timing, special drink requests, etc."
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Quote Request'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gray)' }}>
              No commitment required. We'll follow up with a personalized quote.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
