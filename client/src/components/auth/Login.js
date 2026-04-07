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
    setSendingForgot(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage({ text: data.message, type: 'success' });
      setTimeout(() => setShowForgot(false), 5000);
    } catch (err) {
      setForgotMessage({ 
        text: err.response?.data?.message || 'Failed to send reset email', 
        type: 'error' 
      });
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
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
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
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
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
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sendingForgot}>
                {sendingForgot ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '1rem' }} 
                onClick={() => setShowForgot(false)}
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
