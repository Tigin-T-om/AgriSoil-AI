import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel - Form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {/* Logo */}
          <Link to="/" className="auth-mobile-logo" style={{ display: 'flex' }}>
            <div className="auth-mobile-logo-icon">🌱</div>
            <span className="auth-mobile-logo-text">AgroNova</span>
          </Link>

          {/* Header */}
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join thousands of smart farmers today</p>
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
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="auth-checkbox-group">
              <input
                type="checkbox"
                required
                className="auth-checkbox"
              />
              <span className="auth-checkbox-text">
                I agree to the{' '}
                <a href="#" className="form-link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="form-link">Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <>
                  <div className="auth-spinner"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="auth-left-panel">
        <div className="auth-bg-gradient"></div>
        <div className="auth-grid-pattern"></div>

        {/* Floating Elements */}
        <div className="auth-floating-box auth-floating-1"></div>
        <div className="auth-floating-box auth-floating-2"></div>
        <div className="auth-floating-box auth-floating-3"></div>

        {/* Content */}
        <div className="auth-panel-content">
          <h1 className="auth-panel-title">Start Your Smart Farming Journey</h1>
          <div className="auth-info-cards">
            {[
              { icon: '🔬', title: 'AI Soil Analysis', desc: '11 Kerala soil types' },
              { icon: '🌾', title: 'Crop Recommendations', desc: '23 crops with 95% accuracy' },
              { icon: '🛒', title: 'Product Integration', desc: 'Shop based on your soil' },
            ].map((item, i) => (
              <div key={i} className="auth-info-card">
                <div className="auth-info-icon">{item.icon}</div>
                <div>
                  <h3 className="auth-info-title">{item.title}</h3>
                  <p className="auth-info-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
