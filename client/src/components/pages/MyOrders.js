import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading orders...</div>;

  return (
    <div className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>My Orders</h2>

      {orders.length === 0 ? (
        <div className="cart-empty">
          <h2>No Orders Yet</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
            You haven't placed any orders yet!
          </p>
          <Link to="/menu" className="btn btn-primary">Browse Our Menu</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--cream-dark)' }}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
