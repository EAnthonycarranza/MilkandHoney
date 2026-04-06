import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\u2615'}</div>
        <h2>Order Placed!</h2>
        <p className="auth-subtitle">
          "The Lord bless you and keep you" - Numbers 6:24
        </p>
        <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
          Thank you for your order! We're preparing your drinks with love.
          You can track your order status in your orders page.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-primary">View My Orders</Link>
          <Link to="/menu" className="btn btn-outline">Order More</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
