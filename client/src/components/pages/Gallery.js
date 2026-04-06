import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery')
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'events', label: 'Events' },
    { key: 'menu', label: 'Menu' },
    { key: 'behind-the-scenes', label: 'Behind the Scenes' },
    { key: 'setup', label: 'Cart Setup' },
    { key: 'other', label: 'Other' },
  ];

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const nextImage = () => setLightbox((prev) => (prev + 1) % filtered.length);
  const prevImage = () => setLightbox((prev) => (prev - 1 + filtered.length) % filtered.length);

  useEffect(() => {
    const handleKey = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Gallery</h1>
          <p className="subtitle">A glimpse into the Milk & Honey experience</p>
          <p className="verse">"Taste and see that the Lord is good." — Psalm 34:8</p>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="loading-spinner">Loading gallery...</div>
        ) : (
          <>
            <div className="category-filter">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`category-btn ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="gallery-grid">
                {filtered.map((item, index) => (
                  <div key={item._id} className="gallery-item" onClick={() => openLightbox(index)}>
                    <img src={item.image} alt={item.title || 'Gallery image'} />
                    <div className="gallery-item-overlay">
                      {item.title && <h4>{item.title}</h4>}
                      {item.caption && <p>{item.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3 style={{ color: 'var(--gold-dark)' }}>No Photos Yet</h3>
                <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>Check back soon for gallery updates!</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <button className="lightbox-nav lightbox-prev" onClick={prevImage}>&#8249;</button>
            <img src={filtered[lightbox].image} alt={filtered[lightbox].title || 'Gallery image'} />
            {(filtered[lightbox].title || filtered[lightbox].caption) && (
              <div className="lightbox-caption">
                {filtered[lightbox].title && <h4>{filtered[lightbox].title}</h4>}
                {filtered[lightbox].caption && <p>{filtered[lightbox].caption}</p>}
              </div>
            )}
            <button className="lightbox-nav lightbox-next" onClick={nextImage}>&#8250;</button>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="cta-section">
        <h2>Love What You See?</h2>
        <p>Let us bring the Milk & Honey experience to your next event</p>
        <Link to="/quote" className="btn btn-primary">Request a Free Quote</Link>
      </section>
    </div>
  );
};

export default Gallery;
