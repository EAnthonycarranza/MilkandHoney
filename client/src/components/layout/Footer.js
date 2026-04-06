import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/public').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handle = settings?.instagramHandle || 'milkandhoneycoffeecart';

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Milk & Honey Coffee Cart</h4>
          <p>
            A faith-based mobile coffee cart serving San Antonio, TX.
            We bring the coffee experience to your events with love and excellence.
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <p><Link to="/">Home</Link></p>
          <p><Link to="/menu">Our Menu</Link></p>
          <p><Link to="/about">About Us</Link></p>
          <p><Link to="/quote">Get a Free Quote</Link></p>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>{settings?.businessAddress || 'San Antonio, TX'}</p>
          {settings?.businessEmail && (
            <p><a href={`mailto:${settings.businessEmail}`}>{settings.businessEmail}</a></p>
          )}
          {settings?.businessPhone && (
            <p><a href={`tel:${settings.businessPhone}`}>{settings.businessPhone}</a></p>
          )}
          <p>
            <a href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">
              @{handle}
            </a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-verse">
          "He brought us to this place and gave us this land flowing with milk & honey"
        </p>
        <p>Deuteronomy 26:9</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Milk & Honey Coffee Cart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
