import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', caption: '', category: 'other', order: 0, published: true, image: null, existingImage: null,
  });
  const [bulkForm, setBulkForm] = useState({ category: 'other', images: null });

  // Delete Modal State
  const [deleteItemId, setDeleteItemId] = useState(null);

  // Crop Modal State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

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
      order: item.order || 0, published: item.published, image: null, existingImage: item.image,
    });
    setShowModal(true);
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowCropModal(true);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setForm({ ...form, image: croppedImageBlob });
      setShowCropModal(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('caption', form.caption);
    formData.append('category', form.category);
    formData.append('order', form.order);
    formData.append('published', form.published);
    if (form.image) formData.append('image', form.image, 'cropped.jpg');

    try {
      if (editing) {
        await api.put(`/gallery/${editing}`, formData);
      } else {
        if (!form.image) { alert('Please select an image'); return; }
        await api.post('/gallery', formData);
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
      await api.post('/gallery/bulk', formData);
      setShowBulkModal(false);
      setBulkForm({ category: 'other', images: null });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload images');
    }
  };

  const requestDelete = (id) => {
    setDeleteItemId(id);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await api.delete(`/gallery/${deleteItemId}`);
      fetchItems();
      setDeleteItemId(null);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const togglePublished = async (item) => {
    try {
      const formData = new FormData();
      formData.append('published', !item.published);
      await api.put(`/gallery/${item._id}`, formData);
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
              <button className="btn btn-sm btn-danger" onClick={() => requestDelete(item._id)}>Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
            No gallery images yet. Click "Add Image" or "Bulk Upload" to get started.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteItemId && (
        <div className="delete-modal-overlay" onClick={() => setDeleteItemId(null)}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteItemId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
                {editing && form.existingImage && !form.image && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center', background: 'var(--cream-dark)', padding: '1rem', borderRadius: '8px' }}>
                    <img src={form.existingImage} alt="Current" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }} />
                    <div>
                      <button type="button" className="btn btn-outline btn-sm" onClick={async () => {
                        try {
                          const response = await api.get(`/gallery/proxy-image/${editing}`, { responseType: 'blob' });
                          const dataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(response.data);
                          });
                          setImageSrc(dataUrl);
                          setShowCropModal(true);
                        } catch {
                          alert('Failed to load image for cropping. Please upload a new image instead.');
                        }
                      }}>Crop Current Image</button>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={onFileChange} />
                {form.image && <p style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', marginTop: '0.5rem' }}>Image selected and cropped successfully.</p>}
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

      {/* Crop Modal */}
      {showCropModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="crop-modal-content">
            <h3>Crop Image</h3>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="form-group">
              <label>Zoom</label>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                onChange={(e) => setZoom(Number(e.target.value))} 
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={cancelCrop}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={showCroppedImage}>Save Crop</button>
            </div>
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
