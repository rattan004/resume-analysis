import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#4A90E2"/>
                <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" fill="white"/>
                <circle cx="16" cy="14" r="2" fill="white"/>
                <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>AI Resume Screening Tool</h1>
              <p>Intelligent candidate analysis and ranking</p>
            </div>
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Home
            </Link>
            <Link 
              to="/guide" 
              className={location.pathname === '/guide' ? 'nav-link active' : 'nav-link'}
            >
              Guide
            </Link>
            <Link 
              to="/faq" 
              className={location.pathname === '/faq' ? 'nav-link active' : 'nav-link'}
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}
            >
              Contact
            </Link>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">Hi, {user.name}</span>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className={location.pathname === '/login' ? 'nav-link active signin-btn' : 'nav-link signin-btn'}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
