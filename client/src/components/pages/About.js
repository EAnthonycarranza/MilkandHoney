import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../utils/api';
import { useDarkMode } from '../../hooks/useDarkMode';

const About = () => {
  const [pageContent, setPageContent] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/pages/about').then(res => setPageContent(res.data)).catch(() => {});
    api.get('/settings/public').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const hero = pageContent?.hero || {
    title: 'Our Story',
    subtitle: 'Rooted in faith, brewed with love',
    verse: '"Your mindset is the engine. Your faith is the fuel. Start showing up."'
  };

  const sections = pageContent?.sections || [
    {
      title: 'Who We Are',
      content: 'Milk & Honey Coffee Cart is a Christian-based mobile coffee cart company in San Antonio, Texas. We believe that God brought us to this place and gave us this land flowing with milk and honey. Our mission is to serve the community not just with great coffee, but with the love and grace of Jesus Christ.',
      order: 0
    },
    {
      title: 'Our Faith',
      content: "We want to need Jesus the way people need coffee \u2014 like we can't get through the day without Him. Every cup we serve is an opportunity to share His love, offer encouragement, and build community. We don't just make drinks; we make connections that matter.",
      order: 1
    },
    {
      title: 'Our Service',
      content: "We bring the coffee cart to you! Whether it's a church event, wedding, corporate gathering, or community celebration, Milk & Honey Coffee Cart delivers a premium coffee experience with a personal touch. Every event is an opportunity to serve with excellence.",
      order: 2
    }
  ];

  const isDark = useDarkMode();
  const displayHeroImage = isDark && hero.imageDark ? hero.imageDark : hero.image;

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
        {sections.sort((a, b) => a.order - b.order).map((section, i) => (
          <div key={i} className={`about-section ${i % 2 !== 0 ? 'reverse' : ''}`}>
            <div>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
            <div className="about-section-image">
              {section.image ? (
                <img src={getImageUrl(section.image)} alt={section.title} />
              ) : (
                <span className="placeholder">
                  {i === 0 ? '\u2615' : i === 1 ? '\u271A' : '\u{1F4CD}'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="scripture-banner">
        "I want to need Jesus the way people need coffee, like they can't get through the day without it."
        <span className="scripture-ref">- Milk & Honey Coffee</span>
      </div>

      {/* Contact Info */}
      <section className="contact-section">
        <div className="contact-section-inner">
          <h2 className="contact-heading">Get in Touch</h2>
          <p className="contact-subheading">We'd love to hear from you</p>
          <div className="contact-grid">
            {settings?.businessEmail && (
              <a href={`mailto:${settings.businessEmail}`} className="contact-tile">
                <div className="contact-tile-icon">{'\u2709\uFE0F'}</div>
                <h4>Email</h4>
                <span>{settings.businessEmail}</span>
              </a>
            )}
            {settings?.businessPhone && (
              <a href={`tel:${settings.businessPhone}`} className="contact-tile">
                <div className="contact-tile-icon">{'\uD83D\uDCDE'}</div>
                <h4>Phone</h4>
                <span>{settings.businessPhone}</span>
              </a>
            )}
            <div className="contact-tile">
              <div className="contact-tile-icon">{'\uD83D\uDCCD'}</div>
              <h4>Location</h4>
              <span>{settings?.businessAddress || 'San Antonio, TX'}</span>
            </div>
            <a
              href={`https://www.instagram.com/${settings?.instagramHandle || 'milkandhoneycoffeecart'}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-tile"
            >
              <div className="contact-tile-icon">{'\uD83D\uDCF7'}</div>
              <h4>Instagram</h4>
              <span>@{settings?.instagramHandle || 'milkandhoneycoffeecart'}</span>
            </a>
          </div>
          <Link to="/quote" className="contact-cta-btn">Request a Free Quote</Link>
        </div>
      </section>
    </div>
  );
};

export default About;
