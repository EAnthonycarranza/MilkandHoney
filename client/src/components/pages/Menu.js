import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { useDarkMode } from '../../hooks/useDarkMode';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'signature-latte', label: 'Signature Lattes' },
  { value: 'original-latte', label: 'Original Lattes' },
  { value: 'milk-option', label: 'Milk Options' },
  { value: 'add-on', label: 'Add-Ons' }
];

/* Intersection Observer hook for scroll-triggered animations */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const RevealGroup = ({ children, delay = 0 }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`menu-reveal ${visible ? 'menu-reveal--visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const MenuItemImage = ({ product }) => (
  <div className="menu-item-image">
    {product.image ? (
      <img src={getImageUrl(product.image)} alt={product.name} />
    ) : (
      <span className="menu-item-image-placeholder">
        <i className="fas fa-mug-hot"></i>
      </span>
    )}
  </div>
);

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

  const signatureLattes = filtered.filter(p => p.category === 'signature-latte');
  const originalLattes = filtered.filter(p => p.category === 'original-latte');
  const milkOptionsProducts = filtered.filter(p => p.category === 'milk-option');
  const addOns = filtered.filter(p => p.category === 'add-on');

  const hero = pageContent?.hero || {
    title: 'Our Menu',
    subtitle: 'Crafted with care, served with love',
    verse: '"Taste and see that the Lord is good" — Psalm 34:8'
  };

  const isDark = useDarkMode();
  const displayHeroImage = isDark && hero.imageDark ? hero.imageDark : hero.image;

  const allMilkOptions = [...new Set(products.flatMap(p => p.milkOptions || []))];

  if (loading) return <div className="loading-spinner">Loading menu...</div>;

  let groupIndex = 0;

  return (
    <div className="menu-page">
      {/* Hero */}
      <section
        className={`hero ${displayHeroImage ? 'hero-with-image' : ''}`}
        style={displayHeroImage ? { backgroundImage: `url(${getImageUrl(displayHeroImage)})` } : {}}
      >
        <div className="hero-content menu-hero-content">
          <h1>{hero.title}</h1>
          <p className="subtitle">{hero.subtitle}</p>
          {hero.verse && <p className="verse">{hero.verse}</p>}
        </div>
      </section>

      {/* Page Sections from Admin */}
      {pageContent?.sections && pageContent.sections.length > 0 && (
        <div className="menu-sections-wrapper" style={{ padding: '2rem 1rem 0' }}>
          {pageContent.sections.sort((a, b) => a.order - b.order).map((section, i) => (
            <div key={i} className={`about-section ${i % 2 !== 0 ? 'reverse' : ''}`} style={{ marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: 'var(--gold-dark)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>{section.title}</h2>
                <p style={{ color: 'var(--gray)', lineHeight: 1.7 }}>{section.content}</p>
              </div>
              <div className="about-section-image">
                {section.image ? (
                  <img src={getImageUrl(section.image)} alt={section.title} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu body */}
      <div className="menu-section">
        {/* Category filters */}
        <RevealGroup>
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
        </RevealGroup>

        {/* Signature Lattes */}
        {signatureLattes.length > 0 && (
          <RevealGroup delay={(groupIndex++) * 120}>
            <div className="menu-group">
              {activeCategory === 'all' && <h2 className="menu-group-title">Signature Lattes</h2>}
              <div className="menu-items-list">
                {signatureLattes.map((product, i) => (
                  <div key={product._id} className="menu-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <MenuItemImage product={product} />
                    <div className="menu-item-body">
                      <div className="menu-item-header">
                        <h3 className="menu-item-name">{product.name}</h3>
                        {showPricing && (
                          <>
                            <span className="menu-item-dots"></span>
                            <span className="menu-item-price">${product.price.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <p className="menu-item-desc">{product.description}</p>
                      {product.tags.length > 0 && (
                        <div className="menu-item-tags">
                          {product.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealGroup>
        )}

        {/* Original Lattes */}
        {originalLattes.length > 0 && (
          <RevealGroup delay={(groupIndex++) * 120}>
            <div className="menu-group">
              {activeCategory === 'all' && <h2 className="menu-group-title">Original Lattes</h2>}
              <div className="menu-items-list">
                {originalLattes.map((product, i) => (
                  <div key={product._id} className="menu-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <MenuItemImage product={product} />
                    <div className="menu-item-body">
                      <div className="menu-item-header">
                        <h3 className="menu-item-name">{product.name}</h3>
                        {showPricing && (
                          <>
                            <span className="menu-item-dots"></span>
                            <span className="menu-item-price">${product.price.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <p className="menu-item-desc">{product.description}</p>
                      {product.tags.length > 0 && (
                        <div className="menu-item-tags">
                          {product.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealGroup>
        )}

        {/* Milk Options (Legacy list) */}
        {allMilkOptions.length > 0 && activeCategory === 'all' && (
          <RevealGroup delay={(groupIndex++) * 120}>
            <div className="menu-group milk-options-group">
              <h2 className="menu-group-title">Milk Options</h2>
              <p className="milk-options-text">
                {allMilkOptions.join('  \u00b7  ')}
              </p>
            </div>
          </RevealGroup>
        )}

        {/* Milk Options (Category) */}
        {milkOptionsProducts.length > 0 && (
          <RevealGroup delay={(groupIndex++) * 120}>
            <div className="menu-group">
              {activeCategory === 'all' && <h2 className="menu-group-title">Milk Options</h2>}
              <div className="menu-items-list">
                {milkOptionsProducts.map((product, i) => (
                  <div key={product._id} className="menu-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="menu-item-body">
                      <div className="menu-item-header">
                        <h3 className="menu-item-name">{product.name}</h3>
                        {showPricing && (
                          <>
                            <span className="menu-item-dots"></span>
                            <span className="menu-item-price">${product.price.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <p className="menu-item-desc">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealGroup>
        )}

        {/* Add-Ons */}
        {addOns.length > 0 && (
          <RevealGroup delay={(groupIndex++) * 120}>
            <div className="menu-group">
              {activeCategory === 'all' && <h2 className="menu-group-title">Add-Ons</h2>}
              <div className="menu-items-list">
                {addOns.map(product => (
                  <div key={product._id} className="menu-item">
                    <div className="menu-item-body">
                      <div className="menu-item-header">
                        <h3 className="menu-item-name">*{product.name}</h3>
                        {showPricing && (
                          <>
                            <span className="menu-item-dots"></span>
                            <span className="menu-item-price">${product.price.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealGroup>
        )}

        {filtered.length === 0 && (
          <p className="text-center" style={{ color: 'var(--gray)', padding: '2rem' }}>
            No items in this category yet. Check back soon!
          </p>
        )}
      </div>

      {/* CTA */}
      <RevealGroup>
        <div className="menu-cta">
          <div className="menu-cta-inner">
            <h2>Love What You See?</h2>
            <p>
              Book the Milk &amp; Honey Coffee Cart for your next event and let your guests enjoy all of these drinks and more!
            </p>
            <Link to="/quote" className="btn btn-primary menu-cta-btn">
              Request a Free Quote
            </Link>
          </div>
        </div>
      </RevealGroup>
    </div>
  );
};

export default Menu;
