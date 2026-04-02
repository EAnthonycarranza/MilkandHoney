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
  const [importing, setImporting] = useState(false);

  const loadProducts = () => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadProducts(); }, []);

  const exportCSV = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Tags', 'Available', 'Featured'];
    const rows = products.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price,
      p.category,
      `"${(p.tags || []).join(', ')}"`,
      p.available,
      p.featured,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milk-and-honey-menu-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { alert('CSV file is empty or has no data rows'); setImporting(false); return; }

        // Parse header
        const header = lines[0].toLowerCase();
        const hasHeader = header.includes('name') && header.includes('price');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        let imported = 0;
        for (const line of dataLines) {
          // Simple CSV parse (handles quoted fields)
          const fields = [];
          let current = '';
          let inQuotes = false;
          for (let ch of line) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
            else { current += ch; }
          }
          fields.push(current.trim());

          const [name, description, price, category, tags, available, featured] = fields;
          if (!name) continue;

          const formData = new FormData();
          formData.append('name', name);
          formData.append('description', description || '');
          formData.append('price', parseFloat(price) || 0);
          formData.append('category', category || 'hot-coffee');
          formData.append('tags', JSON.stringify(tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []));
          formData.append('available', available === 'false' ? 'false' : 'true');
          formData.append('featured', featured === 'true' ? 'true' : 'false');

          await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          imported++;
        }
        alert(`Successfully imported ${imported} menu items!`);
        loadProducts();
      } catch (err) {
        alert('Failed to import CSV: ' + (err.response?.data?.message || err.message));
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

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
        <h2>Menu Items</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Export menu as CSV">
            Export CSV
          </button>
          <label className="btn btn-outline btn-sm" style={{ cursor: importing ? 'wait' : 'pointer', opacity: importing ? 0.6 : 1 }}>
            {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={importCSV} style={{ display: 'none' }} disabled={importing} />
          </label>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
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
