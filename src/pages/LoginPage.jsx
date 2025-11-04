import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#4A90E2"/>
                  <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" fill="white"/>
                  <circle cx="16" cy="14" r="2" fill="white"/>
                  <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your AI Resume Screening account</p>
            </div>
          </div>

          <div className="auth-form-section">
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <p>{error}</p>
                </div>
              )}
              
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <div className="auth-switch">
                <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link></p>
              </div>
            </form>
          </div>
        </div>

        <div className="auth-features">
          <h2>AI-Powered Resume Analysis</h2>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div>
                <h3>Smart Matching</h3>
                <p>Advanced AI algorithms match candidates to job requirements</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h3>Detailed Analytics</h3>
                <p>Comprehensive personality and skills analysis</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div>
                <h3>Fast Processing</h3>
                <p>Get results in seconds, not hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
