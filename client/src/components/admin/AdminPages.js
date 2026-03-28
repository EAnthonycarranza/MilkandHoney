import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../utils/api';

const PAGES = [
  { value: 'home', label: 'Home Page' },
  { value: 'about', label: 'About Page' },
  { value: 'menu', label: 'Menu Page' }
];

const AdminPages = () => {
  const [activePage, setActivePage] = useState('home');
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  const [message, setMessage] = useState('');

  const loadPage = () => {
    setLoading(true);
    api.get(`/pages/${activePage}`)
      .then(res => setPageContent(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(); }, [activePage]);

  const updateHero = (field, value) => {
    setPageContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateSection = (index, field, value) => {
    setPageContent(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const addSection = () => {
    setPageContent(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '', image: '', order: prev.sections.length }]
    }));
  };

  const removeSection = (index) => {
    setPageContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const uploadSectionImage = async (index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const { data } = await api.post('/pages/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateSection(index, 'image', data.imageUrl);
      } catch {
        alert('Failed to upload image');
      }
    };
    input.click();
  };

  const addInstagramPost = () => {
    setPageContent(prev => ({
      ...prev,
      instagramPosts: [...(prev.instagramPosts || []), { url: '', caption: '' }]
    }));
  };

  const updateInstagramPost = (index, field, value) => {
    setPageContent(prev => ({
      ...prev,
      instagramPosts: prev.instagramPosts.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const removeInstagramPost = (index) => {
    setPageContent(prev => ({
      ...prev,
      instagramPosts: prev.instagramPosts.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('hero', JSON.stringify(pageContent.hero));
      formData.append('sections', JSON.stringify(pageContent.sections));
      if (pageContent.instagramPosts) {
        formData.append('instagramPosts', JSON.stringify(pageContent.instagramPosts.filter(p => p.url)));
      }
      if (heroImage) formData.append('image', heroImage);

      await api.put(`/pages/${activePage}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Page saved successfully!');
      setHeroImage(null);
      loadPage();
    } catch {
      setMessage('Failed to save page.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="loading-spinner">Loading page content...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Edit Pages</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PAGES.map(p => (
            <button
              key={p.value}
              className={`btn ${activePage === p.value ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setActivePage(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="admin-form">
        {/* Hero Section */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--gold-dark)' }}>Hero Section</h3>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={pageContent?.hero?.title || ''} onChange={e => updateHero('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input type="text" value={pageContent?.hero?.subtitle || ''} onChange={e => updateHero('subtitle', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Bible Verse / Quote</label>
          <input type="text" value={pageContent?.hero?.verse || ''} onChange={e => updateHero('verse', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Hero Background Image</label>
          <input type="file" accept="image/*" onChange={e => setHeroImage(e.target.files[0])} />
          {pageContent?.hero?.image && (
            <div className="image-preview">
              <img src={getImageUrl(pageContent.hero.image)} alt="Hero" />
            </div>
          )}
        </div>

        {/* Sections */}
        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--cream-dark)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--gold-dark)' }}>Content Sections</h3>
            <button className="btn btn-outline btn-sm" onClick={addSection}>+ Add Section</button>
          </div>

          {pageContent?.sections?.map((section, i) => (
            <div key={i} style={{ border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
              <button
                onClick={() => removeSection(i)}
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                {'\u2715'}
              </button>
              <div className="form-group">
                <label>Section Title</label>
                <input type="text" value={section.title} onChange={e => updateSection(i, 'title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea value={section.content} onChange={e => updateSection(i, 'content', e.target.value)} rows="4" />
              </div>
              <div className="form-group">
                <label>Section Image</label>
                <button className="btn btn-outline btn-sm" onClick={() => uploadSectionImage(i)}>
                  {section.image ? 'Change Image' : 'Upload Image'}
                </button>
                {section.image && (
                  <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                    <img src={getImageUrl(section.image)} alt="Section" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Order</label>
                <input type="number" value={section.order} onChange={e => updateSection(i, 'order', parseInt(e.target.value))} style={{ width: 80 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Posts (Home page only) */}
        {activePage === 'home' && (
          <div style={{ marginTop: '2rem', borderTop: '2px solid var(--cream-dark)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold-dark)' }}>Instagram Posts</h3>
              <button className="btn btn-outline btn-sm" onClick={addInstagramPost}>+ Add Post</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1rem' }}>
              Paste Instagram post URLs to embed them on the home page. Use the full URL like: https://www.instagram.com/p/XXXXXX/
            </p>

            {(pageContent?.instagramPosts || []).map((post, i) => (
              <div key={i} className="instagram-admin-post">
                <div style={{ flex: 1 }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={post.url}
                      onChange={e => updateInstagramPost(i, 'url', e.target.value)}
                      placeholder="https://www.instagram.com/p/XXXXXX/"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      value={post.caption || ''}
                      onChange={e => updateInstagramPost(i, 'caption', e.target.value)}
                      placeholder="Optional caption"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeInstagramPost(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.2rem', alignSelf: 'flex-start', padding: '0.5rem' }}
                >
                  {'\u2715'}
                </button>
              </div>
            ))}

            {(pageContent?.instagramPosts || []).length === 0 && (
              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray)', fontStyle: 'italic' }}>
                No Instagram posts added yet. Click "+ Add Post" to embed posts from your Instagram.
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
