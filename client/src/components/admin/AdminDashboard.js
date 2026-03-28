import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AdminProducts from './AdminProducts';
import AdminQuotes from './AdminQuotes';
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
        <h3>Admin Panel</h3>
        <ul className="admin-sidebar-links">
          <li><Link to="/admin" className={isActive('')}>Dashboard</Link></li>
          <li><Link to="/admin/quotes" className={isActive('/quotes')}>Quote Requests</Link></li>
          <li><Link to="/admin/products" className={isActive('/products')}>Menu Items</Link></li>
          <li><Link to="/admin/pages" className={isActive('/pages')}>Edit Pages</Link></li>
          <li><Link to="/admin/settings" className={isActive('/settings')}>Settings</Link></li>
        </ul>
      </aside>
      <main className="admin-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="products" element={<AdminProducts />} />
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
    <div>
      <div className="admin-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalQuotes || 0}</div>
          <div className="stat-label">Total Quote Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.newQuotes || 0}</div>
          <div className="stat-label">New / Unread</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.bookedQuotes || 0}</div>
          <div className="stat-label">Booked Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Menu Items</div>
        </div>
      </div>

      {/* Recent Quotes */}
      {stats?.recentQuotes?.length > 0 && (
        <div className="admin-table-container">
          <div style={{ padding: '1rem 1rem 0.5rem', fontWeight: 700 }}>Recent Quote Requests</div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Event</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentQuotes.map(q => (
                <tr key={q._id}>
                  <td><strong>{q.name}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{q.email}</span></td>
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
      )}
    </div>
  );
};

export default AdminDashboard;
