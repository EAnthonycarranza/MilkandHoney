import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = () => {
    const query = filterStatus ? `?status=${filterStatus}` : '';
    api.get(`/orders${query}`)
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      loadOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="loading-spinner">Loading orders...</div>;

  return (
    <div>
      <div className="admin-header">
        <h2>Orders</h2>
        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '2px solid var(--cream-dark)', fontSize: '0.9rem' }}
          >
            <option value="">All Orders</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Customer:</strong> {order.user?.name || 'N/A'}
                <br />
                <strong>Email:</strong> {order.user?.email || 'N/A'}
              </div>
              <div>
                <strong>Pickup Name:</strong> {order.pickupName}
                <br />
                {order.pickupPhone && <><strong>Phone:</strong> {order.pickupPhone}<br /></>}
                {order.pickupTime && <><strong>Pickup Time:</strong> {order.pickupTime}</>}
              </div>
            </div>

            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {order.notes && (
              <p style={{ fontSize: '0.85rem', color: 'var(--gray)', fontStyle: 'italic', marginBottom: '1rem' }}>
                Notes: {order.notes}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--cream-dark)' }}>
              <strong style={{ fontSize: '1.1rem' }}>Total: ${order.total.toFixed(2)}</strong>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Update Status:</label>
                <select
                  value={order.status}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid var(--cream-dark)', fontSize: '0.85rem' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;
