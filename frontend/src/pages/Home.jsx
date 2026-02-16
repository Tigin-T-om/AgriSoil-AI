import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: '🔬',
      title: 'AI Soil Analysis',
      description: 'Advanced machine learning for accurate soil classification with Kerala-specific soil types.',
      colorClass: 'feature-icon-blue',
    },
    {
      icon: '🌾',
      title: 'Smart Crop Recommendations',
      description: 'Get personalized crop suggestions based on soil, climate, and environmental conditions.',
      colorClass: 'feature-icon-green',
    },
    {
      icon: '📊',
      title: 'Hybrid Intelligence',
      description: 'Combines ML predictions with agricultural rule validation for 95%+ accuracy.',
      colorClass: 'feature-icon-purple',
    },
    {
      icon: '🛒',
      title: 'Integrated Marketplace',
      description: 'Shop seeds and products recommended specifically for your soil conditions.',
      colorClass: 'feature-icon-orange',
    },
  ];

  const stats = [
    { value: '95%+', label: 'Accuracy' },
    { value: '11', label: 'Soil Types' },
    { value: '23', label: 'Crops' },
    { value: '10K+', label: 'Predictions' },
  ];

  const soilTypes = [
    { name: 'Laterite', description: 'Iron-rich acidic soil', color: '#c0392b' },
    { name: 'Riverine Alluvial', description: 'Highly fertile river soil', color: '#8e6835' },
    { name: 'Forest Loam', description: 'Organic-rich forest soil', color: '#2c3e50' },
    { name: 'Coastal Alluvial', description: 'Sandy coastal soil', color: '#f39c12' },
    { name: 'Peaty', description: 'Marshy organic soil', color: '#1a1a1a' },
    { name: 'Red Loam', description: 'Fertile reddish soil', color: '#e74c3c' },
  ];

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Background Effects */}
        <div className="hero-bg-glow-1" />
        <div className="hero-bg-glow-2" />
        <div className="hero-bg-glow-3" />
        <div className="hero-grid-pattern" />

        <div className="hero-content">
          <div className="hero-inner">
            {/* Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot">
                <span className="hero-badge-dot-ping"></span>
                <span className="hero-badge-dot-inner"></span>
              </span>
              Powered by AI • 95%+ Accuracy
            </div>

            {/* Title */}
            <h1 className="hero-title">
              Revolutionize
              <span className="hero-title-gradient">
                Agriculture with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Analyze your soil, get smart crop recommendations, and discover the perfect products
              for your land — all powered by advanced machine learning.
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons">
              <Link to="/soil-analysis" className="hero-btn-primary">
                <span>Start Soil Analysis</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/shop" className="hero-btn-secondary">
                Browse Products
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat">
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose <span className="section-title-gradient">Agri-Soil AI</span>?
            </h2>
            <p className="section-subtitle">
              Cutting-edge technology meets traditional agricultural wisdom
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className={`feature-icon ${feature.colorClass}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Soil Types Section */}
      <section className="soil-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Kerala <span className="section-title-gradient">Soil Types</span>
            </h2>
            <p className="section-subtitle">
              Our AI recognizes 11 soil types including 8 Kerala-specific varieties
            </p>
          </div>

          <div className="soil-grid">
            {soilTypes.map((soil, index) => (
              <div key={index} className="soil-card">
                <div
                  className="soil-color-box"
                  style={{ backgroundColor: soil.color }}
                />
                <h4 className="soil-name">{soil.name}</h4>
                <p className="soil-desc">{soil.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-glow" />

        <div className="section-container cta-content">
          <h2 className="cta-title">Ready to Transform Your Farming?</h2>
          <p className="cta-subtitle">
            Join thousands of farmers using AI-powered insights to maximize their yield
          </p>
          <Link to="/soil-analysis" className="cta-btn">
            <span>🌱</span>
            <span>Start Free Analysis</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <span>🌱</span>
              </div>
              <span className="footer-logo-text">Agri-Soil AI</span>
            </div>
            <p className="footer-copyright">
              © 2026 Agri-Soil AI. All rights reserved. Made with ❤️ for farmers.
            </p>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
