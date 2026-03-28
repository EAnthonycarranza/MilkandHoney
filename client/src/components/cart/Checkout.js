import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickupName: user?.name || '',
    pickupPhone: user?.phone || '',
    pickupTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/orders', {
        items: items.map(i => ({
          product: i.product,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions
        })),
        ...form
      });

      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="section">
      <div className="checkout-form">
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Checkout</h2>
        <p className="section-subtitle" style={{ textAlign: 'left' }}>
          Almost there! Fill in your pickup details.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Order Summary */}
        <div style={{ background: 'var(--cream)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Order Summary</h4>
          {items.map((item, i) => (
            <div key={i} className="order-item-row">
              <span>{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-item-row" style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pickup Name</label>
            <input type="text" name="pickupName" value={form.pickupName} onChange={handleChange} required placeholder="Name for the order" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="pickupPhone" value={form.pickupPhone} onChange={handleChange} placeholder="(555) 123-4567" />
          </div>
          <div className="form-group">
            <label>Preferred Pickup Time (optional)</label>
            <input type="text" name="pickupTime" value={form.pickupTime} onChange={handleChange} placeholder="e.g., 10:30 AM" />
          </div>
          <div className="form-group">
            <label>Special Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special requests or dietary needs?" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
