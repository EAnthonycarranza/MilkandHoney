import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const STATUSES = ['new', 'contacted', 'quoted', 'booked', 'declined'];

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // State for multi-selection
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, ids: [] });

  // State for editing a quote
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const loadQuotes = () => {
    const query = filterStatus ? `?status=${filterStatus}` : '';
    api.get(`/quotes${query}`)
      .then(res => setQuotes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    loadQuotes(); 
    setSelectedIds([]); // Reset selection when filter changes
  }, [filterStatus]);

  const updateQuote = async (id, data) => {
    try {
      await api.put(`/quotes/${id}`, data);
      loadQuotes();
    } catch { alert('Failed to update quote'); }
  };

  const openDeleteModal = (ids) => {
    setDeleteModal({ show: true, ids: Array.isArray(ids) ? ids : [ids] });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, ids: [] });
  };

  const confirmDelete = async () => {
    try {
      if (deleteModal.ids.length === 1) {
        await api.delete(`/quotes/${deleteModal.ids[0]}`);
      } else {
        // Assuming there's a bulk delete endpoint or we delete in loop
        // For robustness, we'll do them in parallel if no bulk endpoint
        await Promise.all(deleteModal.ids.map(id => api.delete(`/quotes/${id}`)));
      }
      setSelectedIds(prev => prev.filter(id => !deleteModal.ids.includes(id)));
      loadQuotes();
      closeDeleteModal();
    } catch { 
      alert('Failed to delete quote(s)'); 
      closeDeleteModal();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === quotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotes.map(q => q._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleEditClick = (quote) => {
    setEditingId(quote._id);
    setEditFormData({
      name: quote.name || '',
      email: quote.email || '',
      phone: quote.phone || '',
      eventType: quote.eventType || '',
      eventDate: quote.eventDate || '',
      guestCount: quote.guestCount || '',
      location: quote.location || '',
      details: quote.details || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id) => {
    await updateQuote(id, editFormData);
    setEditingId(null);
  };

  const exportToCSV = () => {
    if (!quotes || quotes.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Event Type', 'Event Date', 'Guest Count', 'Location', 'Status', 'Details', 'Admin Notes', 'Date Submitted'];
    const rows = quotes.map(q => [
      `"${q.name || ''}"`,
      `"${q.email || ''}"`,
      `"${q.phone || ''}"`,
      `"${q.eventType || ''}"`,
      `"${q.eventDate || ''}"`,
      `"${q.guestCount || ''}"`,
      `"${q.location || ''}"`,
      `"${q.status || ''}"`,
      `"${(q.details || '').replace(/"/g, '""')}"`,
      `"${(q.adminNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(q.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quotes_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="loading-spinner">Loading quotes...</div>;

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Quote Requests</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => openDeleteModal(selectedIds)} 
              className="btn btn-danger btn-sm"
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={exportToCSV} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            Export to CSV
          </button>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '2px solid var(--cream-dark)', fontSize: '0.9rem' }}
          >
            <option value="">All Requests</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          checked={quotes.length > 0 && selectedIds.length === quotes.length}
          onChange={toggleSelectAll}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Select All</span>
      </div>

      {quotes.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No quote requests found.</p>
      ) : (
        quotes.map(q => (
          <div key={q._id} className={`order-card ${selectedIds.includes(q._id) ? 'selected' : ''}`} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-30px', top: '24px' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(q._id)}
                onChange={() => toggleSelect(q._id)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
            
            <div className="order-card-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(q._id)}
                  onChange={() => toggleSelect(q._id)}
                  className="mobile-only-checkbox"
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  {editingId === q._id ? (
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                      style={{ fontSize: '1.1rem', fontWeight: 'bold', padding: '0.2rem', marginBottom: '0.2rem', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  ) : (
                    <strong style={{ fontSize: '1.1rem' }}>{q.name}</strong>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                    {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <span className={`status-badge status-${q.status === 'new' ? 'pending' : q.status}`}>{q.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <strong>Email:</strong> {editingId === q._id ? (
                  <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : <a href={`mailto:${q.email}`} style={{ color: 'var(--gold-dark)' }}>{q.email}</a>}
              </div>
              <div>
                <strong>Phone:</strong> {editingId === q._id ? (
                  <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : (q.phone ? <a href={`tel:${q.phone}`} style={{ color: 'var(--gold-dark)' }}>{q.phone}</a> : 'N/A')}
              </div>
              <div>
                <strong>Event Type:</strong> {editingId === q._id ? (
                  <input type="text" value={editFormData.eventType} onChange={e => setEditFormData({...editFormData, eventType: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : <span style={{ textTransform: 'capitalize' }}>{q.eventType}</span>}
              </div>
              <div>
                <strong>Event Date:</strong> {editingId === q._id ? (
                  <input type="text" value={editFormData.eventDate} onChange={e => setEditFormData({...editFormData, eventDate: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : q.eventDate}
              </div>
              <div>
                <strong>Guest Count:</strong> {editingId === q._id ? (
                  <input type="text" value={editFormData.guestCount} onChange={e => setEditFormData({...editFormData, guestCount: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : q.guestCount}
              </div>
              <div>
                <strong>Location:</strong> {editingId === q._id ? (
                  <input type="text" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} style={{ width: '100%', padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : q.location}
              </div>
            </div>

            {(q.details || editingId === q._id) && (
              <div style={{ background: 'var(--cream)', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
                <strong>Details:</strong><br />
                {editingId === q._id ? (
                  <textarea
                    value={editFormData.details}
                    onChange={e => setEditFormData({...editFormData, details: e.target.value})}
                    style={{ width: '100%', padding: '0.4rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    rows="3"
                  />
                ) : q.details}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--cream-dark)', flexWrap: 'wrap', gap: '0.5rem' }}>
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
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {editingId === q._id ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(q._id)}>Save</button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(q)}>Edit Details</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                      {expandedId === q._id ? 'Hide Notes' : 'Notes'}
                    </button>
                    <a href={`mailto:${q.email}`} className="btn btn-primary btn-sm">Reply</a>
                    <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(q._id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {deleteModal.ids.length === 1 ? 'this quote request' : `these ${deleteModal.ids.length} quote requests`}? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
