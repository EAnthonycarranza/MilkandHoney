import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ITEMS_PER_PAGE = 6;

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get('/gallery')
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
    setShowAll(false);
  }, [activeCategory]);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'events', label: 'Events' },
    { key: 'menu', label: 'Menu' },
    { key: 'behind-the-scenes', label: 'Behind the Scenes' },
    { key: 'setup', label: 'Cart Setup' },
    { key: 'other', label: 'Other' },
  ];

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  
  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = showAll ? filtered : filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openLightbox = (index) => {
    // index is relative to paginatedItems, need absolute index in filtered
    const absoluteIndex = showAll ? index : (currentPage - 1) * ITEMS_PER_PAGE + index;
    setLightbox(absoluteIndex);
  };
  
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => setShowAll(!showAll)}
                style={{ fontSize: '0.8rem' }}
              >
                {showAll ? 'Show Paginated' : 'View All Photos'}
              </button>
            </div>

            {filtered.length > 0 ? (
              <>
                <div className="gallery-grid">
                  {paginatedItems.map((item, index) => (
                    <div key={item._id} className="gallery-item" onClick={() => openLightbox(index)}>
                      <img src={item.image} alt={item.title || 'Gallery image'} />
                      <div className="gallery-item-overlay">
                        {item.title && <h4>{item.title}</h4>}
                        {item.caption && <p>{item.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Dots */}
                {totalPages > 1 && !showAll && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          window.scrollTo({ top: document.querySelector('.gallery-grid').offsetTop - 150, behavior: 'smooth' });
                        }}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: 'none',
                          background: currentPage === i + 1 ? 'var(--gold)' : 'var(--cream-dark)',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.3s ease',
                          transform: currentPage === i + 1 ? 'scale(1.2)' : 'scale(1)',
                          boxShadow: currentPage === i + 1 ? '0 0 8px rgba(200, 169, 81, 0.4)' : 'none'
                        }}
                        aria-label={`Go to page ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
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
