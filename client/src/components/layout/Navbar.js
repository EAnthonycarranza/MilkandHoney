import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import Logo from '../../assets/Logo.png';
import DarkModeLogo from '../../assets/DarkModeLogo.png';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = useDarkMode();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={isDark ? DarkModeLogo : Logo} alt="Milk & Honey Coffee" className="brand-logo" />
          Milk & Honey
        </Link>

        <button className={`mobile-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/menu" className={isActive('/menu')} onClick={() => setMenuOpen(false)}>Menu</Link></li>
          <li><Link to="/events" className={isActive('/events')} onClick={() => setMenuOpen(false)}>Events</Link></li>
          <li><Link to="/gallery" className={isActive('/gallery')} onClick={() => setMenuOpen(false)}>Gallery</Link></li>
          <li><Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/quote" className={isActive('/quote')} onClick={() => setMenuOpen(false)}>Get a Quote</Link></li>

          {user ? (
            <>
              {isAdmin && (
                <li><Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>Admin</Link></li>
              )}
              <li>
                <Link to="/" onClick={(e) => { e.preventDefault(); logout(); setMenuOpen(false); }}>
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <li><Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
