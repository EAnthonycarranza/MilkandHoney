import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password !== confirmPassword) {
      return setMessage({ text: 'Passwords do not match', type: 'error' });
    }

    if (password.length < 8) {
      return setMessage({ text: 'Password must be at least 8 characters long', type: 'error' });
    }

    // Password strength check
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!strongRegex.test(password)) {
      return setMessage({ 
        text: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 
        type: 'error' 
      });
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage({ text: data.message + ' Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to reset password', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create New Password</h2>
        <p className="auth-subtitle">Please enter a strong password for your account</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />
          </div>
          
          <div style={{ background: 'var(--cream)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--gray)' }}>
            <strong>Password Requirements:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li>At least 8 characters long</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one number (0-9)</li>
              <li>At least one special character (!@#$%^&*)</li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
