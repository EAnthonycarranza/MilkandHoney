import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/api';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
          Looks like you haven't added any drinks yet!
        </p>
        <Link to="/menu" className="btn btn-primary">Browse Our Menu</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Your Cart</h2>

      {items.map((item, index) => (
        <div key={index} className="cart-item">
          <div className="cart-item-image">
            {item.image ? (
              <img src={getImageUrl(item.image)} alt={item.name} />
            ) : (
              <span style={{ fontSize: '1.5rem', color: 'var(--gold-light)' }}>{'\u2615'}</span>
            )}
          </div>
          <div className="cart-item-details">
            <h4>{item.name}</h4>
            <p style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>${item.price.toFixed(2)}</p>
            {item.specialInstructions && (
              <p className="special">Note: {item.specialInstructions}</p>
            )}
          </div>
          <div className="quantity-control">
            <button onClick={() => updateQuantity(index, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
          </div>
          <p style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
            ${(item.price * item.quantity).toFixed(2)}
          </p>
          <button
            onClick={() => removeItem(index)}
            style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            {'\u2715'}
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={clearCart}>Clear Cart</button>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary">Login to Checkout</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
