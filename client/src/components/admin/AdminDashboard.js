import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AdminProducts from './AdminProducts';
import AdminQuotes from './AdminQuotes';
import AdminEvents from './AdminEvents';
import AdminGallery from './AdminGallery';
import AdminPages from './AdminPages';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/" />;

  const isActive = (path) => location.pathname === `/admin${path}` ? 'active' : '';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Admin Panel</h3>
          <p>Milk & Honey Coffee</p>
        </div>
        <ul className="admin-sidebar-links">
          <li>
            <Link to="/admin" className={isActive('')}>
              <span className="icon"><i className="fas fa-house"></i></span> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/quotes" className={isActive('/quotes')}>
              <span className="icon"><i className="fas fa-envelope-open-text"></i></span> Quote Requests
            </Link>
          </li>
          <li>
            <Link to="/admin/products" className={isActive('/products')}>
              <span className="icon"><i className="fas fa-mug-hot"></i></span> Menu Items
            </Link>
          </li>
          <li>
            <Link to="/admin/events" className={isActive('/events')}>
              <span className="icon"><i className="fas fa-calendar-alt"></i></span> Events
            </Link>
          </li>
          <li>
            <Link to="/admin/gallery" className={isActive('/gallery')}>
              <span className="icon"><i className="fas fa-images"></i></span> Gallery
            </Link>
          </li>
          <li>
            <Link to="/admin/pages" className={isActive('/pages')}>
              <span className="icon"><i className="fas fa-file-alt"></i></span> Edit Pages
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className={isActive('/settings')}>
              <span className="icon"><i className="fas fa-cog"></i></span> Settings
            </Link>
          </li>
        </ul>
        <div className="admin-sidebar-footer">
          <Link to="/" className="btn btn-outline btn-sm">View Website</Link>
        </div>
      </aside>
      <main className="admin-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

  return (
    <div className="dashboard-overview">
      <div className="admin-header-welcome">
        <div className="welcome-text">
          <h2>Welcome back, Admin! <i className="fas fa-hand-peace" style={{ color: 'var(--gold)', marginLeft: '0.5rem' }}></i></h2>
          <p>Here's what's happening with Milk & Honey Coffee today.</p>
        </div>
        <div className="header-actions">
          <span className="current-date"><i className="fas fa-calendar-day" style={{ marginRight: '0.5rem', color: 'var(--gold)' }}></i>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon"><i className="fas fa-paper-plane"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalQuotes || 0}</div>
            <div className="stat-label">Total Quote Requests</div>
          </div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-icon"><i className="fas fa-bell"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.newQuotes || 0}</div>
            <div className="stat-label">New / Unread</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon"><i className="fas fa-handshake"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.bookedQuotes || 0}</div>
            <div className="stat-label">Booked Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-mug-hot"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Menu Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalEvents || 0}</div>
            <div className="stat-label">Past Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-image"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalGallery || 0}</div>
            <div className="stat-label">Gallery Images</div>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      {stats?.recentQuotes?.length > 0 && (
        <div className="dashboard-recent-section">
          <div className="section-header">
            <h3>Recent Quote Requests</h3>
            <Link to="/admin/quotes" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="admin-table-container shadow-sm">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Event Type</th>
                  <th>Event Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentQuotes.slice(0, 5).map(q => (
                  <tr key={q._id}>
                    <td>
                      <div className="customer-info">
                        <div className="avatar-placeholder">{q.name.charAt(0)}</div>
                        <div>
                          <strong>{q.name}</strong>
                          <span className="customer-email">{q.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{q.eventType}</td>
                    <td>{q.eventDate}</td>
                    <td>{q.guestCount}</td>
                    <td><span className={`status-badge status-${q.status === 'new' ? 'pending' : q.status}`}>{q.status}</span></td>
                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
