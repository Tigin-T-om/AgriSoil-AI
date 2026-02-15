import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({ username: formData.username, password: formData.password });
      // Redirect based on role
      if (result.user?.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel - Decorative */}
      <div className="auth-left-panel">
        {/* Background */}
        <div className="auth-bg-gradient"></div>
        <div className="auth-grid-pattern"></div>

        {/* Floating Elements */}
        <div className="auth-floating-box auth-floating-1"></div>
        <div className="auth-floating-box auth-floating-2"></div>
        <div className="auth-floating-box auth-floating-3"></div>

        {/* Content */}
        <div className="auth-panel-content">
          <div className="auth-panel-header">
            <div className="auth-panel-logo">🌱</div>
            <h1 className="auth-panel-title">Welcome to AgroNova</h1>
            <p className="auth-panel-text">
              Your AI-powered companion for smart agriculture. Analyze soil, get crop recommendations, and shop with confidence.
            </p>
          </div>

          <div className="auth-features">
            {['95%+ Accurate Predictions', 'Kerala Soil Types', 'Smart Recommendations'].map((item, i) => (
              <div key={i} className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg className="auth-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="auth-feature-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {/* Logo for mobile */}
          <Link to="/" className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">🌱</div>
            <span className="auth-mobile-logo-text">AgroNova</span>
          </Link>

          {/* Header */}
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <svg className="auth-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <a href="#" className="form-link">Forgot password?</a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <>
                  <div className="auth-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">or continue with</span>
            <div className="auth-divider-line"></div>
          </div>

          {/* Social Login */}
          <div className="auth-social-buttons">
            <div className="auth-social-btn">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log("Google Login Success:", credentialResponse);
                  // Send credentialResponse.credential to backend
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
            <button className="auth-social-btn">
              <svg className="auth-social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              X
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-footer-link">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
