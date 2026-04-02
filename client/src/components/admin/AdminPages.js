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
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const loadPage = () => {
    setLoading(true);
    api.get(`/pages/${activePage}`)
      .then(res => setPageContent(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(); setActiveTab('hero'); }, [activePage]);

  const updateHero = (field, value) => {
    setPageContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
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
    if (!window.confirm('Remove this section?')) return;
    setPageContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index, direction) => {
    setPageContent(prev => {
      const sections = [...prev.sections];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections: sections.map((s, i) => ({ ...s, order: i })) };
    });
  };

  const duplicateSection = (index) => {
    setPageContent(prev => {
      const section = { ...prev.sections[index], title: prev.sections[index].title + ' (copy)', order: prev.sections.length };
      return { ...prev, sections: [...prev.sections, section] };
    });
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

  const removeSectionImage = (index) => {
    updateSection(index, 'image', '');
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

  const uploadHeroImageDark = async () => {
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
        updateHero('imageDark', data.imageUrl);
      } catch {
        alert('Failed to upload image');
      }
    };
    input.click();
  };

  const removeHeroImageDark = () => {
    updateHero('imageDark', '');
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

  const heroImgSrc = heroImage ? URL.createObjectURL(heroImage) : getImageUrl(pageContent?.hero?.image);

  return (
    <div>
      <div className="admin-header">
        <h2>Edit Pages</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {PAGES.map(p => (
            <button
              key={p.value}
              className={`btn ${activePage === p.value ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setActivePage(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span style={{ width: 1, height: 24, background: 'var(--cream-dark)', margin: '0 0.25rem' }} />
          <button
            className={`btn btn-sm ${showPreview ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="page-editor-layout" style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Editor Panel */}
        <div className="admin-form" style={{ flex: showPreview ? '0 0 55%' : '1' }}>
          {/* Tab Navigation */}
          <div className="editor-tabs">
            <button className={`editor-tab ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
              Hero Section
            </button>
            <button className={`editor-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
              Content ({pageContent?.sections?.length || 0})
            </button>
            {activePage === 'home' && (
              <button className={`editor-tab ${activeTab === 'instagram' ? 'active' : ''}`} onClick={() => setActiveTab('instagram')}>
                Instagram
              </button>
            )}
          </div>

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="editor-tab-content">
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={pageContent?.hero?.title || ''} onChange={e => updateHero('title', e.target.value)} placeholder="Page title..." />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <input type="text" value={pageContent?.hero?.subtitle || ''} onChange={e => updateHero('subtitle', e.target.value)} placeholder="A brief description..." />
              </div>
              <div className="form-group">
                <label>Bible Verse / Quote</label>
                <input type="text" value={pageContent?.hero?.verse || ''} onChange={e => updateHero('verse', e.target.value)} placeholder="Scripture or inspirational quote..." />
              </div>
              <div className="form-group">
                <label>Hero Background Image (Light Mode)</label>
                <input type="file" accept="image/*" onChange={e => setHeroImage(e.target.files[0])} />
                {heroImgSrc && (
                  <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                    <img src={heroImgSrc} alt="Hero Light" style={{ maxHeight: 150, borderRadius: 8, objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Hero Background Image (Dark Mode) - Optional</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="btn btn-outline btn-sm" onClick={uploadHeroImageDark}>
                    {pageContent?.hero?.imageDark ? 'Change Dark Image' : 'Upload Dark Image'}
                  </button>
                  {pageContent?.hero?.imageDark && (
                    <button className="btn btn-sm btn-danger" onClick={removeHeroImageDark}>Remove</button>
                  )}
                </div>
                {pageContent?.hero?.imageDark && (
                  <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                    <img src={getImageUrl(pageContent.hero.imageDark)} alt="Hero Dark" style={{ maxHeight: 150, borderRadius: 8, objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="editor-tab-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                  Drag sections to reorder, or use the arrow buttons.
                </p>
                <button className="btn btn-outline btn-sm" onClick={addSection}>+ Add Section</button>
              </div>

              {pageContent?.sections?.map((section, i) => (
                <div key={i} className="section-editor-card">
                  <div className="section-editor-header">
                    <div className="section-editor-order">
                      <button className="section-arrow" onClick={() => moveSection(i, -1)} disabled={i === 0} title="Move up">&uarr;</button>
                      <span className="section-number">{i + 1}</span>
                      <button className="section-arrow" onClick={() => moveSection(i, 1)} disabled={i === pageContent.sections.length - 1} title="Move down">&darr;</button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => updateSection(i, 'title', e.target.value)}
                        placeholder="Section title..."
                        className="section-title-input"
                      />
                    </div>
                    <div className="section-editor-actions">
                      <button className="section-action-btn" onClick={() => duplicateSection(i)} title="Duplicate">&#10697;</button>
                      <button className="section-action-btn danger" onClick={() => removeSection(i)} title="Remove">&times;</button>
                    </div>
                  </div>
                  <div className="section-editor-body">
                    <div className="form-group">
                      <label>Content</label>
                      <textarea
                        value={section.content}
                        onChange={e => updateSection(i, 'content', e.target.value)}
                        rows="4"
                        placeholder="Write your section content here..."
                      />
                      <span className="char-count">{section.content?.length || 0} characters</span>
                    </div>
                    <div className="form-group">
                      <label>Section Image (Light Mode)</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => uploadSectionImage(i, false)}>
                          {section.image ? 'Change Image' : 'Upload Image'}
                        </button>
                        {section.image && (
                          <button className="btn btn-sm btn-danger" onClick={() => removeSectionImage(i, false)}>Remove</button>
                        )}
                      </div>
                      {section.image && (
                        <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                          <img src={getImageUrl(section.image)} alt="Section Light" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Section Image (Dark Mode) - Optional</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => uploadSectionImage(i, true)}>
                          {section.imageDark ? 'Change Image' : 'Upload Image'}
                        </button>
                        {section.imageDark && (
                          <button className="btn btn-sm btn-danger" onClick={() => removeSectionImage(i, true)}>Remove</button>
                        )}
                      </div>
                      {section.imageDark && (
                        <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                          <img src={getImageUrl(section.imageDark)} alt="Section Dark" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!pageContent?.sections || pageContent.sections.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)', fontStyle: 'italic' }}>
                  No content sections yet. Click "+ Add Section" to start building your page.
                </div>
              )}
            </div>
          )}

          {/* Instagram Tab */}
          {activeTab === 'instagram' && activePage === 'home' && (
            <div className="editor-tab-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                  Paste Instagram post URLs to embed on the home page.
                </p>
                <button className="btn btn-outline btn-sm" onClick={addInstagramPost}>+ Add Post</button>
              </div>

              {(pageContent?.instagramPosts || []).map((post, i) => (
                <div key={i} className="instagram-admin-post">
                  <div style={{ flex: 1 }}>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <input type="text" value={post.url} onChange={e => updateInstagramPost(i, 'url', e.target.value)} placeholder="https://www.instagram.com/p/XXXXXX/" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input type="text" value={post.caption || ''} onChange={e => updateInstagramPost(i, 'caption', e.target.value)} placeholder="Optional caption" style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <button onClick={() => removeInstagramPost(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.2rem', alignSelf: 'flex-start', padding: '0.5rem' }}>
                    &times;
                  </button>
                </div>
              ))}

              {(pageContent?.instagramPosts || []).length === 0 && (
                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray)', fontStyle: 'italic' }}>
                  No Instagram posts added yet.
                </p>
              )}
            </div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={loadPage}>Discard Changes</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="page-preview-panel">
            <div className="preview-header">
              <span>Live Preview</span>
              <span className="preview-badge">{PAGES.find(p => p.value === activePage)?.label}</span>
            </div>
            <div className="preview-content">
              {/* Hero Preview */}
              <div className="preview-hero" style={heroImgSrc ? { backgroundImage: `url(${heroImgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                <div className="preview-hero-inner" style={heroImgSrc ? { background: 'rgba(255,255,255,0.9)', padding: '1.5rem', borderRadius: 8 } : {}}>
                  <h2 style={{ color: 'var(--gold-dark)', fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                    {pageContent?.hero?.title || 'Page Title'}
                  </h2>
                  {pageContent?.hero?.subtitle && (
                    <p style={{ fontStyle: 'italic', color: 'var(--brown-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {pageContent.hero.subtitle}
                    </p>
                  )}
                  {pageContent?.hero?.verse && (
                    <p style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {pageContent.hero.verse}
                    </p>
                  )}
                </div>
              </div>

              {/* Sections Preview */}
              {pageContent?.sections?.map((section, i) => (
                <div key={i} className="preview-section" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('sections'); }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {section.image && (
                      <img src={getImageUrl(section.image)} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--gold-dark)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {section.title || `Section ${i + 1}`}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray)', lineHeight: 1.5 }}>
                        {section.content ? (section.content.length > 120 ? section.content.slice(0, 120) + '...' : section.content) : 'No content yet...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {(!pageContent?.sections || pageContent.sections.length === 0) && (
                <div className="preview-section" style={{ textAlign: 'center', color: 'var(--gray)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  No content sections
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPages;
