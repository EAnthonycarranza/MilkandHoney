import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });
  const [sendingForgot, setSendingForgot] = useState(false);
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage({ text: '', type: '' });
    setShowRegisterSuggestion(false);
    setSendingForgot(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage({ text: data.message, type: 'success' });
      setTimeout(() => {
        if (!showRegisterSuggestion) setShowForgot(false);
      }, 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset email';
      if (err.response?.status === 404) {
        setForgotMessage({ text: 'Email not found', type: 'error' });
        setShowRegisterSuggestion(true);
      } else {
        setForgotMessage({ text: msg, type: 'error' });
      }
    } finally {
      setSendingForgot(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {!showForgot ? (
          <>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">"Come to me, all you who are weary" - Matthew 11:28</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <div className="auth-input-wrapper">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgot(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="auth-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>

            {forgotMessage.text && (
              <div className={`alert alert-${forgotMessage.type}`}>{forgotMessage.text}</div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sendingForgot}>
                {sendingForgot ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                ) : 'Send Reset Link'}
              </button>

              {showRegisterSuggestion && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: 'var(--cream)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--gold-light)',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  animation: 'menuFadeUp 0.4s ease-out'
                }}>
                  <p style={{ marginBottom: '0.5rem', color: 'var(--brown)' }}>New to Milk & Honey?</p>
                  <Link to="/register" style={{ color: 'var(--gold-dark)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Create an account instead
                  </Link>
                </div>
              )}

              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '1rem' }} 
                onClick={() => {
                  setShowForgot(false);
                  setShowRegisterSuggestion(false);
                  setForgotMessage({ text: '', type: '' });
                }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
