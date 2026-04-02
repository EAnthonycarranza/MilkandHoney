import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'hot-coffee', label: 'Hot Coffee' },
  { value: 'iced-coffee', label: 'Iced Coffee' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'non-coffee', label: 'Non-Coffee' },
  { value: 'pastry', label: 'Pastries' }
];

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [pageContent, setPageContent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/products?available=true'),
      api.get('/pages/menu'),
      api.get('/settings/public')
    ]).then(([productsRes, pageRes, settingsRes]) => {
      setProducts(productsRes.data);
      setPageContent(pageRes.data);
      setShowPricing(settingsRes.data.showPricing || false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const hero = pageContent?.hero || {
    title: 'Our Menu',
    subtitle: 'Every drink we serve is crafted with care and purpose',
    verse: '"Taste and see that the Lord is good" - Psalm 34:8'
  };

  const isDark = useDarkMode();
  const displayHeroImage = isDark && hero.imageDark ? hero.imageDark : hero.image;

  if (loading) return <div className="loading-spinner">Loading menu...</div>;

  return (
    <div>
      <section
        className={`hero ${displayHeroImage ? 'hero-with-image' : ''}`}
        style={displayHeroImage ? { backgroundImage: `url(${getImageUrl(displayHeroImage)})` } : {}}
      >
        <div className="hero-content">
          <h1>{hero.title}</h1>
          <p className="subtitle">{hero.subtitle}</p>
          {hero.verse && <p className="verse">{hero.verse}</p>}
        </div>
      </section>

      <div className="section">
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem', color: 'var(--gray)', fontSize: '1.05rem' }}>
          When you book the Milk & Honey Coffee Cart, your guests get to choose from our full menu
          of handcrafted drinks. Here's a taste of what we offer:
        </p>

        <div className="category-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`category-btn ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--gray)', padding: '2rem' }}>
            No items in this category yet. Check back soon!
          </p>
        ) : (
          <div className="products-grid">
            {filtered.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-card-image">
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} />
                  ) : (
                    <span className="placeholder">{'\u2615'}</span>
                  )}
                </div>
                <div className="product-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3>{product.name}</h3>
                    {showPricing && <span style={{ fontWeight: 600, color: 'var(--gold-dark)', whiteSpace: 'nowrap' }}>${product.price.toFixed(2)}</span>}
                  </div>
                  <p>{product.description}</p>
                  {product.tags.length > 0 && (
                    <div className="product-card-tags">
                      {product.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="section" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Love What You See?</h2>
          <p style={{ maxWidth: '550px', margin: '0 auto 1.5rem' }}>
            Book the Milk & Honey Coffee Cart for your next event and let your guests enjoy all of these drinks and more!
          </p>
          <Link to="/quote" className="btn btn-primary">
            Request a Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Menu;
