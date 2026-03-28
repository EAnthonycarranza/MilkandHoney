import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const STATUSES = ['new', 'contacted', 'quoted', 'booked', 'declined'];

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadQuotes = () => {
    const query = filterStatus ? `?status=${filterStatus}` : '';
    api.get(`/quotes${query}`)
      .then(res => setQuotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuotes(); }, [filterStatus]);

  const updateQuote = async (id, data) => {
    try {
      await api.put(`/quotes/${id}`, data);
      loadQuotes();
    } catch { alert('Failed to update quote'); }
  };

  const deleteQuote = async (id) => {
    if (!window.confirm('Delete this quote request?')) return;
    try {
      await api.delete(`/quotes/${id}`);
      loadQuotes();
    } catch { alert('Failed to delete quote'); }
  };

  if (loading) return <div className="loading-spinner">Loading quotes...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Quote Requests</h2>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '2px solid var(--cream-dark)', fontSize: '0.9rem' }}
        >
          <option value="">All Requests</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {quotes.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No quote requests found.</p>
      ) : (
        quotes.map(q => (
          <div key={q._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{q.name}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                  {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`status-badge status-${q.status === 'new' ? 'pending' : q.status}`}>{q.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div><strong>Email:</strong> <a href={`mailto:${q.email}`} style={{ color: 'var(--gold-dark)' }}>{q.email}</a></div>
              {q.phone && <div><strong>Phone:</strong> <a href={`tel:${q.phone}`} style={{ color: 'var(--gold-dark)' }}>{q.phone}</a></div>}
              <div><strong>Event Type:</strong> <span style={{ textTransform: 'capitalize' }}>{q.eventType}</span></div>
              <div><strong>Event Date:</strong> {q.eventDate}</div>
              <div><strong>Guest Count:</strong> {q.guestCount}</div>
              <div><strong>Location:</strong> {q.location}</div>
            </div>

            {q.details && (
              <div style={{ background: 'var(--cream)', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
                <strong>Details:</strong> {q.details}
              </div>
            )}

            {/* Admin Notes */}
            {expandedId === q._id && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Admin Notes</label>
                <textarea
                  defaultValue={q.adminNotes}
                  onBlur={e => updateQuote(q._id, { adminNotes: e.target.value })}
                  rows="3"
                  placeholder="Add internal notes about this quote..."
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--cream-dark)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</label>
                <select
                  value={q.status}
                  onChange={e => updateQuote(q._id, { status: e.target.value })}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid var(--cream-dark)', fontSize: '0.85rem' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                  {expandedId === q._id ? 'Hide Notes' : 'Notes'}
                </button>
                <a href={`mailto:${q.email}`} className="btn btn-primary btn-sm">Reply</a>
                <button className="btn btn-danger btn-sm" onClick={() => deleteQuote(q._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminQuotes;
