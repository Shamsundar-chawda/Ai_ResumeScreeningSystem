import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import UploadResume from './components/UploadResume';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import './App.css';

function Navigation({ isAdmin, onLogout }) {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-brand">AI Resume Screener</div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Candidate Upload</Link>
        {isAdmin && (
          <>
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin Dashboard</Link>
            <button onClick={onLogout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ isAdmin, children }) {
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  const handleLogin = (role) => {
    if (role === 'admin') {
      setIsAdmin(true);
      sessionStorage.setItem('adminAuth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('adminAuth');
  };

  return (
    <Router>
      <div className="app-layout">
        <Navigation isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="container">
          <Routes>
            <Route path="/" element={<UploadResume />} />
            <Route path="/login" element={
              isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={handleLogin} />
            } />
            <Route path="/admin" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Subtle admin access — barely visible, bottom-right corner */}
        {!isAdmin && (
          <Link to="/login" style={{
            position: 'fixed', bottom: '12px', right: '14px',
            opacity: 0.12, fontSize: '0.7rem', color: 'var(--text-muted)',
            transition: 'opacity 0.3s', textDecoration: 'none', zIndex: 50
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.4}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.12}
          >
            🔒
          </Link>
        )}
      </div>
    </Router>
  );
}

export default App;
