// frontend/src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛣️</span>
          <span className="logo-text">
            Smart<span className="logo-accent">Road</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/report" className={`nav-link ${isActive('/report') ? 'active' : ''}`}>Report Damage</Link>
          <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>Map View</Link>
          {user && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Reports
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`nav-link nav-link-admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right Controls */}
        <div className="navbar-actions">
          {/* Theme toggle */}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar" onClick={() => setMenuOpen((v) => !v)}>
                <span className="avatar-initials">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="avatar-name">{user.name.split(' ')[0]}</span>
                <span className="avatar-chevron">▾</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className="dropdown-role">{user.role}</span>
                  </div>
                  <hr />
                  <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
                    📋 Reports
                  </button>
                  {isAdmin && (
                    <button className="dropdown-item" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>
                      ⚙️ Admin Panel
                    </button>
                  )}
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)}>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
          <Link to="/report" className="mobile-link" onClick={() => setMenuOpen(false)}>📍 Report Damage</Link>
          <Link to="/map" className="mobile-link" onClick={() => setMenuOpen(false)}>🗺️ Map View</Link>
          {user && (
            <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>📋 Reports</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>⚙️ Admin Panel</Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>🔐 Login</Link>
              <Link to="/signup" className="mobile-link" onClick={() => setMenuOpen(false)}>✨ Sign Up</Link>
            </>
          )}
          {user && (
            <button className="mobile-link mobile-logout" onClick={handleLogout}>🚪 Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
