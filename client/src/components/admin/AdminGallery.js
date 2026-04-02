import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', caption: '', category: 'other', order: 0, published: true, image: null,
  });
  const [bulkForm, setBulkForm] = useState({ category: 'other', images: null });

  const fetchItems = () => {
    api.get('/gallery/all')
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm({ title: '', caption: '', category: 'other', order: 0, published: true, image: null });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditing(item._id);
    setForm({
      title: item.title || '', caption: item.caption || '', category: item.category,
      order: item.order || 0, published: item.published, image: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('caption', form.caption);
    formData.append('category', form.category);
    formData.append('order', form.order);
    formData.append('published', form.published);
    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await api.put(`/gallery/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        if (!form.image) { alert('Please select an image'); return; }
        await api.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save gallery item');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkForm.images || bulkForm.images.length === 0) { alert('Please select images'); return; }
    const formData = new FormData();
    formData.append('category', bulkForm.category);
    for (let i = 0; i < bulkForm.images.length; i++) {
      formData.append('images', bulkForm.images[i]);
    }
    try {
      await api.post('/gallery/bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowBulkModal(false);
      setBulkForm({ category: 'other', images: null });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery image?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      fetchItems();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const togglePublished = async (item) => {
    try {
      const formData = new FormData();
      formData.append('published', !item.published);
      await api.put(`/gallery/${item._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchItems();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const categoryLabels = {
    events: 'Events', menu: 'Menu', 'behind-the-scenes': 'Behind the Scenes', setup: 'Cart Setup', other: 'Other',
  };

  if (loading) return <div className="loading-spinner">Loading gallery...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Gallery</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowBulkModal(true)}>Bulk Upload</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Image</button>
        </div>
      </div>

      <div className="admin-gallery-grid">
        {items.map(item => (
          <div key={item._id} className="admin-gallery-item">
            <div className="admin-gallery-img">
              <img src={item.image} alt={item.title || 'Gallery'} />
              {!item.published && <span className="draft-badge">Draft</span>}
            </div>
            <div className="admin-gallery-info">
              <span className="tag">{categoryLabels[item.category] || item.category}</span>
              {item.title && <p className="admin-gallery-title">{item.title}</p>}
            </div>
            <div className="admin-gallery-actions">
              <button className="btn btn-sm btn-outline" onClick={() => togglePublished(item)}>
                {item.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
            No gallery images yet. Click "Add Image" or "Bulk Upload" to get started.
          </div>
        )}
      </div>

      {/* Single Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Gallery Image' : 'Add Gallery Image'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title (optional)</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Caption (optional)</label>
                <textarea rows="2" value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="events">Events</option>
                    <option value="menu">Menu</option>
                    <option value="behind-the-scenes">Behind the Scenes</option>
                    <option value="setup">Cart Setup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-group">
                <label>{editing ? 'Replace Image' : 'Image *'}</label>
                <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} />
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} />
                Published
              </label>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Image'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Bulk Upload Images</h3>
            <form onSubmit={handleBulkUpload}>
              <div className="form-group">
                <label>Category</label>
                <select value={bulkForm.category} onChange={e => setBulkForm({...bulkForm, category: e.target.value})}>
                  <option value="events">Events</option>
                  <option value="menu">Menu</option>
                  <option value="behind-the-scenes">Behind the Scenes</option>
                  <option value="setup">Cart Setup</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Select Images (up to 20)</label>
                <input type="file" accept="image/*" multiple onChange={e => setBulkForm({...bulkForm, images: e.target.files})} />
                {bulkForm.images && <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.5rem' }}>{bulkForm.images.length} file(s) selected</p>}
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload All</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
