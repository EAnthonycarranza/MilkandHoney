import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { useDarkMode } from '../../hooks/useDarkMode';
import InstagramFeed from './InstagramFeed';
import Logo from '../../assets/Logo.png';
import DarkModeLogo from '../../assets/DarkModeLogo.png';

const Home = () => {
  const [pageContent, setPageContent] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const isDark = useDarkMode();

  useEffect(() => {
    api.get('/pages/home').then(res => setPageContent(res.data)).catch(() => {});
    api.get('/products?available=true').then(res => {
      setFeaturedItems(res.data.filter(p => p.featured).slice(0, 4));
    }).catch(() => {});
    api.get('/settings/public').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const hero = pageContent?.hero || {
    title: 'Milk & Honey Coffee Cart',
    subtitle: 'He brought us to this place and gave us this land flowing with milk & honey',
    verse: 'Deuteronomy 26:9'
  };

  const sections = pageContent?.sections || [];
  const displayHeroImage = isDark && hero.imageDark ? hero.imageDark : hero.image;

  return (
    <div>
      {/* Hero */}
      <section
        className={`hero ${displayHeroImage ? 'hero-with-image' : ''}`}
        style={displayHeroImage ? { backgroundImage: `url(${getImageUrl(displayHeroImage)})` } : {}}
      >
        <div className="hero-content">
          <img src={isDark ? DarkModeLogo : Logo} alt="Milk & Honey Coffee" className="hero-logo" />
          <h1>{hero.title}</h1>
          <p className="subtitle">{hero.subtitle}</p>
          {hero.verse && <p className="verse">{hero.verse}</p>}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/quote" className="btn btn-primary">Get a Free Quote</Link>
            <Link to="/about" className="btn btn-outline">Our Story</Link>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.sort((a, b) => a.order - b.order).map((section, i) => {
        const displaySectionImage = isDark && section.imageDark ? section.imageDark : section.image;
        return (
          <section key={i} className={i % 2 === 0 ? '' : 'section-alt'}>
            <div className="section">
              <div className={`about-section ${i % 2 === 0 ? '' : 'reverse'}`}>
                <div className="about-section-text">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
                <div className="about-section-image">
                  {displaySectionImage ? (
                    <img src={getImageUrl(displaySectionImage)} alt={section.title} />
                  ) : (
                    <span className="placeholder">{i === 0 ? '\u2615' : '\u2764'}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Services Section */}
      <div className="section-alt">
        <div className="section">
          <h2 className="section-title">What We Offer</h2>
          <p className="section-subtitle">Professional mobile coffee cart service for any occasion</p>
          <div className="services-grid">
            <div className="service-card">
              <span className="service-icon">{'\u{1F492}'}</span>
              <h3>Weddings</h3>
              <p>Make your special day even sweeter with a custom coffee bar for your guests.</p>
            </div>
            <div className="service-card">
              <span className="service-icon">{'\u{26EA}'}</span>
              <h3>Church Events</h3>
              <p>Fellowship is better with coffee. Let us serve your congregation with love.</p>
            </div>
            <div className="service-card">
              <span className="service-icon">{'\u{1F3E2}'}</span>
              <h3>Corporate Events</h3>
              <p>Impress clients and energize your team with a professional coffee cart experience.</p>
            </div>
            <div className="service-card">
              <span className="service-icon">{'\u{1F389}'}</span>
              <h3>Parties & Celebrations</h3>
              <p>Birthdays, anniversaries, graduations — we bring the party fuel.</p>
            </div>
            <div className="service-card">
              <span className="service-icon">{'\u{1F91D}'}</span>
              <h3>Community Events</h3>
              <p>Festivals, fundraisers, and neighborhood gatherings — we're there to serve.</p>
            </div>
            <div className="service-card">
              <span className="service-icon">{'\u2B50'}</span>
              <h3>Custom Events</h3>
              <p>Have something unique in mind? We'll tailor our service to fit your vision.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Banner */}
      <div className="scripture-banner">
        "Your mindset is the engine. Your faith is the fuel. Start showing up."
        <span className="scripture-ref">- Milk & Honey Coffee</span>
      </div>

      {/* Featured Menu Preview */}
      {featuredItems.length > 0 && (
        <div className="section">
          <h2 className="section-title">What We Serve</h2>
          <p className="section-subtitle">"Taste and see that the Lord is good" - Psalm 34:8</p>
          <div className="products-grid">
            {featuredItems.map(item => (
              <div key={item._id} className="product-card">
                <div className="product-card-image">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <span className="placeholder">{'\u2615'}</span>
                  )}
                </div>
                <div className="product-card-body">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  {item.tags.length > 0 && (
                    <div className="product-card-tags">
                      {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/menu" className="btn btn-outline">View Full Menu</Link>
          </div>
        </div>
      )}

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA Section */}
      <div className="cta-section">
        <div className="section" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>Ready to Book Your Event?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '1.1rem' }}>
            We'd love to bring the Milk & Honey experience to your next event.
            Request a free, no-obligation quote today!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/quote" className="btn btn-primary" style={{ background: 'var(--white)', color: 'var(--gold-dark)' }}>
              Get a Free Quote
            </Link>
            {settings?.businessEmail && (
              <a href={`mailto:${settings.businessEmail}`} className="btn btn-outline" style={{ borderColor: 'var(--white)', color: 'var(--white)' }}>
                Email Us
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Final Scripture */}
      <div className="scripture-banner">
        "Don't wait to get better to change your life. Change your life so you can be better."
        <span className="scripture-ref">- Milk & Honey Coffee</span>
      </div>
    </div>
  );
};

export default Home;
