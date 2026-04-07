import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', locationName: '',
    eventType: 'other', featured: false, published: true, image: null,
  });

  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const fetchEvents = () => {
    api.get('/events/all')
      .then(res => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  // Load Google Maps script for autocomplete
  useEffect(() => {
    if (showModal) {
      const loadGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          initAutocomplete();
          return;
        }
        
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
        if (!apiKey) return;

        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = initAutocomplete;
          document.head.appendChild(script);
        } else {
          // Script already exists, just wait for it to load if it hasn't yet
          const checkExist = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              initAutocomplete();
              clearInterval(checkExist);
            }
          }, 100);
        }
      };

      const initAutocomplete = () => {
        if (!locationInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;
        
        autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setForm(prev => ({ ...prev, location: place.formatted_address }));
          }
        });
      };

      loadGoogleMaps();
    }
  }, [showModal]);

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', time: '', location: '', locationName: '', eventType: 'other', featured: false, published: true, image: null });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (event) => {
    setEditing(event._id);
    setForm({
      title: event.title, 
      description: event.description || '', 
      date: event.date,
      time: event.time || '', 
      location: event.location, 
      locationName: event.locationName || '',
      eventType: event.eventType,
      featured: event.featured, 
      published: event.published, 
      image: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('date', form.date);
    formData.append('time', form.time);
    formData.append('location', form.location);
    formData.append('locationName', form.locationName);
    formData.append('eventType', form.eventType);
    formData.append('featured', form.featured);
    formData.append('published', form.published);
    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await api.put(`/events/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const togglePublished = async (event) => {
    try {
      const formData = new FormData();
      formData.append('published', !event.published);
      await api.put(`/events/${event._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchEvents();
    } catch (err) {
      alert('Failed to update event');
    }
  };

  const eventTypeLabels = {
    wedding: 'Wedding', church: 'Church', corporate: 'Corporate', birthday: 'Birthday',
    community: 'Community', fundraiser: 'Fundraiser', 'pop-up': 'Pop-Up', other: 'Other',
  };

  // Generate time slots for dropdown
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const min = m === 0 ? '00' : m;
        slots.push(`${hour}:${min} ${ampm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (loading) return <div className="loading-spinner">Loading events...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Events</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Event</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>
                  {event.image ? (
                    <img src={event.image} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 60, height: 60, background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>&#9749;</div>
                  )}
                </td>
                <td><strong>{event.title}</strong></td>
                <td>{event.date}{event.time ? ` at ${event.time}` : ''}</td>
                <td>
                  {event.locationName && <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.locationName}</div>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{event.location}</div>
                </td>
                <td><span className="tag">{eventTypeLabels[event.eventType] || event.eventType}</span></td>
                <td>
                  <button
                    className={`btn btn-sm ${event.published ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => togglePublished(event)}
                  >
                    {event.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(event)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No events yet. Click "Add Event" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
                    <option value="">Select Time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Location Name (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Central Park, Main Lobby" 
                  value={form.locationName} 
                  onChange={e => setForm({...form, locationName: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input 
                  ref={locationInputRef}
                  type="text" 
                  placeholder="Start typing address..." 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Type</label>
                  <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                    <option value="wedding">Wedding</option>
                    <option value="church">Church Event</option>
                    <option value="corporate">Corporate</option>
                    <option value="birthday">Birthday</option>
                    <option value="community">Community</option>
                    <option value="fundraiser">Fundraiser</option>
                    <option value="pop-up">Pop-Up</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} />
                </div>
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
                  Featured Event
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} />
                  Published
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update Event' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
