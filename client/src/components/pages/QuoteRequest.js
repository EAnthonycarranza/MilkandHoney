import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { useDarkMode } from '../../hooks/useDarkMode';

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding', icon: '\uD83D\uDC8D' },
  { value: 'church', label: 'Church Event', icon: '\u26EA' },
  { value: 'corporate', label: 'Corporate Event', icon: '\uD83C\uDFE2' },
  { value: 'birthday', label: 'Birthday / Party', icon: '\uD83C\uDF89' },
  { value: 'community', label: 'Community Event', icon: '\uD83C\uDF1F' },
  { value: 'fundraiser', label: 'Fundraiser', icon: '\u2764\uFE0F' },
  { value: 'other', label: 'Other', icon: '\u2615' }
];

const GUEST_COUNTS = [
  { value: '1-25', label: '1 - 25 guests' },
  { value: '26-50', label: '26 - 50 guests' },
  { value: '51-100', label: '51 - 100 guests' },
  { value: '101-200', label: '101 - 200 guests' },
  { value: '200+', label: '200+ guests' }
];

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const QuoteRequest = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', location: '', details: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const isDark = useDarkMode();
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const minDate = getTomorrowDate();

  useEffect(() => {
    api.get('/settings/public').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  // Load Google Maps Places API
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
    if (!apiKey) return;
    if (window.google && window.google.maps && window.google.maps.places) return;
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete when Google Maps is loaded and input is ready
  const initAutocomplete = useCallback(() => {
    if (!locationInputRef.current) return;
    if (autocompleteRef.current) return;
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' }
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setForm(prev => ({ ...prev, location: place.formatted_address }));
      } else if (place && place.name) {
        setForm(prev => ({ ...prev, location: place.name }));
      }
    });
  }, []);

  useEffect(() => {
    // Try to init immediately
    initAutocomplete();

    // Also poll briefly in case the script is still loading
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [initAutocomplete]);

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
      <div className="quote-success-page">
        <div className="quote-success-card">
          <div className="quote-success-icon">{'\u2615'}</div>
          <h2>Quote Request Sent!</h2>
          <p className="quote-success-verse">
            "The Lord bless you and keep you" - Numbers 6:24
          </p>
          <p className="quote-success-text">
            Thank you for your interest in Milk & Honey Coffee Cart!
            We've received your request and will get back to you within 24-48 hours
            with a personalized quote for your event.
          </p>
          {settings?.businessEmail && (
            <p className="quote-success-contact">
              Questions? Email us at{' '}
              <a href={`mailto:${settings.businessEmail}`}>
                {settings.businessEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page">
      <section className="quote-hero">
        <div className="quote-hero-content">
          <span className="quote-hero-badge">Free Estimate</span>
          <h1>Let's Plan Your Perfect Event</h1>
          <p className="quote-hero-subtitle">Tell us about your event and we'll craft a custom coffee experience</p>
          <p className="quote-hero-verse">"For I know the plans I have for you" - Jeremiah 29:11</p>
        </div>
      </section>

      <div className="quote-container">
        <div className="quote-steps-bar">
          <div className="quote-step-item">
            <span className="quote-step-num">1</span>
            <span className="quote-step-text">Fill out details</span>
          </div>
          <div className="quote-step-divider"></div>
          <div className="quote-step-item">
            <span className="quote-step-num">2</span>
            <span className="quote-step-text">Get your quote</span>
          </div>
          <div className="quote-step-divider"></div>
          <div className="quote-step-item">
            <span className="quote-step-num">3</span>
            <span className="quote-step-text">Confirm booking</span>
          </div>
        </div>

        {error && (
          <div className="quote-alert-error">
            <span className="quote-alert-icon">{'\u26A0\uFE0F'}</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="quote-form">
          {/* Contact Info Section */}
          <div className="quote-section-card">
            <h3 className="quote-section-title">Contact Information</h3>
            <div className="quote-field-grid">
              <div className={`quote-field ${focusedField === 'name' ? 'focused' : ''} ${form.name ? 'has-value' : ''}`}>
                <label htmlFor="q-name">
                  <span className="quote-field-icon">{'\uD83D\uDC64'}</span>
                  Your Name *
                </label>
                <input
                  id="q-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Full name"
                  autoComplete="name"
                />
              </div>
              <div className={`quote-field ${focusedField === 'email' ? 'focused' : ''} ${form.email ? 'has-value' : ''}`}>
                <label htmlFor="q-email">
                  <span className="quote-field-icon">{'\u2709\uFE0F'}</span>
                  Email Address *
                </label>
                <input
                  id="q-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div className={`quote-field quote-field-full ${focusedField === 'phone' ? 'focused' : ''} ${form.phone ? 'has-value' : ''}`}>
                <label htmlFor="q-phone">
                  <span className="quote-field-icon">{'\uD83D\uDCDE'}</span>
                  Phone Number
                </label>
                <input
                  id="q-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="quote-section-card">
            <h3 className="quote-section-title">Event Details</h3>

            <div className="quote-event-type-grid">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`quote-event-type-btn ${form.eventType === t.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, eventType: t.value })}
                >
                  <span className="quote-event-type-icon">{t.icon}</span>
                  <span className="quote-event-type-label">{t.label}</span>
                </button>
              ))}
            </div>
            {/* Hidden select for form validation */}
            <select
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              required
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <div className="quote-field-grid" style={{ marginTop: '1.5rem' }}>
              <div className={`quote-field ${focusedField === 'eventDate' ? 'focused' : ''} ${form.eventDate ? 'has-value' : ''}`}>
                <label htmlFor="q-date">
                  <span className="quote-field-icon">{'\uD83D\uDCC5'}</span>
                  Event Date *
                </label>
                <input
                  id="q-date"
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('eventDate')}
                  onBlur={() => setFocusedField(null)}
                  required
                  min={minDate}
                />
              </div>
              <div className={`quote-field ${focusedField === 'guestCount' ? 'focused' : ''} ${form.guestCount ? 'has-value' : ''}`}>
                <label htmlFor="q-guests">
                  <span className="quote-field-icon">{'\uD83D\uDC65'}</span>
                  Guest Count *
                </label>
                <select
                  id="q-guests"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('guestCount')}
                  onBlur={() => setFocusedField(null)}
                  required
                >
                  <option value="">Select guest count...</option>
                  {GUEST_COUNTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className={`quote-field quote-field-full ${focusedField === 'location' ? 'focused' : ''} ${form.location ? 'has-value' : ''}`}>
                <label htmlFor="q-location">
                  <span className="quote-field-icon">{'\uD83D\uDCCD'}</span>
                  Event Location *
                </label>
                <input
                  id="q-location"
                  ref={locationInputRef}
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Search for a venue or address"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="quote-section-card">
            <h3 className="quote-section-title">Anything Else?</h3>
            <div className={`quote-field ${focusedField === 'details' ? 'focused' : ''} ${form.details ? 'has-value' : ''}`}>
              <label htmlFor="q-details">
                <span className="quote-field-icon">{'\uD83D\uDCAC'}</span>
                Additional Details
              </label>
              <textarea
                id="q-details"
                name="details"
                value={form.details}
                onChange={handleChange}
                onFocus={() => setFocusedField('details')}
                onBlur={() => setFocusedField(null)}
                rows="4"
                placeholder="Tell us more about your event — theme, timing, special drink requests, etc."
              />
            </div>
          </div>

          <button type="submit" className="quote-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="quote-spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Quote Request'
            )}
          </button>
          <p className="quote-disclaimer">
            No commitment required. We'll follow up with a personalized quote.
          </p>
        </form>
      </div>
    </div>
  );
};

export default QuoteRequest;
