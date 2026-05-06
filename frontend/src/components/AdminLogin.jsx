import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'reset'
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.role);
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/reset-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryKey, newUsername, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setRecoveryKey('');
        setNewUsername('');
        setNewPassword('');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '420px', margin: '4rem auto', paddingTop: '2rem' }}>
      <div className="glass-panel text-center">
        {/* Icon */}
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          background: mode === 'login' 
            ? 'linear-gradient(135deg, var(--primary), #6366F1)' 
            : 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          boxShadow: mode === 'login' 
            ? '0 8px 24px rgba(79, 70, 229, 0.4)' 
            : '0 8px 24px rgba(245, 158, 11, 0.4)',
          transition: 'all 0.4s ease'
        }}>
          {mode === 'login' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          )}
        </div>

        <h2 style={{ marginBottom: '0.25rem' }}>
          {mode === 'login' ? 'Admin Login' : 'Reset Credentials'}
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          {mode === 'login' 
            ? 'Sign in to access the HR dashboard' 
            : 'Enter your recovery key to set new credentials'}
        </p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', 
            marginBottom: '1.5rem', fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', 
            color: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px', 
            marginBottom: '1.5rem', fontSize: '0.9rem'
          }}>
            ✅ {success}
          </div>
        )}

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter admin username" required autoFocus />

              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button 
              onClick={() => { setMode('reset'); setError(''); }}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.8rem', marginTop: '1.25rem', opacity: 0.8, transition: 'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
            >
              Forgot credentials?
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleReset} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recovery Key</label>
              <input type="password" value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)} placeholder="Enter secret recovery key" required autoFocus />

              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>New Username</label>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Enter new username" required />

              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Set New Credentials'}
              </button>
            </form>

            <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.25rem' }}
            >
              ← Back to Login
            </button>
          </>
        )}

        <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          This portal is restricted to HR administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
