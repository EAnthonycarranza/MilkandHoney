import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../utils/api';

const CATEGORIES = [
  { value: 'hot-coffee', label: 'Hot Coffee' },
  { value: 'iced-coffee', label: 'Iced Coffee' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'non-coffee', label: 'Non-Coffee' },
  { value: 'pastry', label: 'Pastry' }
];

const emptyForm = {
  name: '', description: '', price: '', category: 'hot-coffee', tags: '', available: true, featured: false
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = () => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadProducts(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImage(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      tags: product.tags.join(', '),
      available: product.available,
      featured: product.featured
    });
    setEditingId(product._id);
    setImage(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('available', form.available.toString());
      formData.append('featured', form.featured.toString());
      if (image) formData.append('image', image);

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <div className="loading-spinner">Loading products...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ width: 45, height: 45, borderRadius: 6, overflow: 'hidden', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? <img src={getImageUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '\u2615'}
                  </div>
                </td>
                <td><strong>{p.name}</strong></td>
                <td>{CATEGORIES.find(c => c.value === p.category)?.label}</td>
                <td>${p.price.toFixed(2)}</td>
                <td><span className={`status-badge ${p.available ? 'status-completed' : 'status-cancelled'}`}>{p.available ? 'Available' : 'Unavailable'}</span></td>
                <td>{p.featured ? 'Yes' : 'No'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="admin-form" style={{ padding: 0, boxShadow: 'none' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="popular, signature, honey" />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                  Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Featured
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
