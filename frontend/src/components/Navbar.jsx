import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/shop', label: 'Products', icon: '🛍️' },
        { path: '/soil-analysis', label: 'Soil Analysis', icon: '🔬' },
        { path: '/cart', label: 'Cart', icon: '🛒' },
        { path: '/my-orders', label: 'My Orders', icon: '📦' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : 'navbar-transparent'}`}>
                <div className="navbar-container">
                    <div className="navbar-inner">
                        {/* Logo */}
                        <Link to="/" className="navbar-logo">
                            <div className="navbar-logo-icon">
                                <span>🌱</span>
                            </div>
                            <div className="navbar-logo-text">
                                <span className="navbar-logo-name">Agri-Soil AI</span>
                                <span className="navbar-logo-tagline">AI-Powered Agriculture</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="navbar-nav">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`navbar-link ${isActive(link.path) ? 'navbar-link-active' : 'navbar-link-inactive'}`}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* User Section */}
                        <div className="navbar-user-section">
                            {user ? (
                                <>
                                    {/* Admin Link */}
                                    {user.is_admin && (
                                        <Link to="/admin/dashboard" className="navbar-admin-link">
                                            <span>⚡</span>
                                            <span>Admin</span>
                                        </Link>
                                    )}

                                    {/* User Avatar */}
                                    <div className="navbar-user-avatar">
                                        <div className="navbar-avatar-icon">
                                            {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="navbar-avatar-name">{user.full_name?.split(' ')[0] || user.username || 'User'}</span>
                                    </div>

                                    {/* Logout Button */}
                                    <button onClick={handleLogout} className="navbar-logout-btn">
                                        <span>🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="navbar-auth-buttons">
                                    <Link to="/login" className="navbar-signin-link">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="navbar-signup-link">
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="navbar-mobile-btn"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'navbar-mobile-menu-open' : 'navbar-mobile-menu-closed'}`}>
                    <div className="navbar-mobile-menu-content">
                        <div className="navbar-mobile-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`navbar-mobile-link ${isActive(link.path) ? 'navbar-mobile-link-active' : 'navbar-mobile-link-inactive'}`}
                                >
                                    <span className="navbar-mobile-link-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile User Section */}
                        {user ? (
                            <div className="navbar-mobile-user">
                                <div className="navbar-mobile-user-info">
                                    <div className="navbar-mobile-avatar">
                                        {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="navbar-mobile-user-name">{user.full_name || user.username || 'User'}</p>
                                        <p className="navbar-mobile-user-email">{user.email}</p>
                                    </div>
                                </div>
                                {user.is_admin && (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="navbar-mobile-admin-link"
                                    >
                                        <span>⚡</span>
                                        <span>Admin Dashboard</span>
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="navbar-mobile-logout-btn">
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="navbar-mobile-auth">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="navbar-mobile-signin"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="navbar-mobile-signup"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="navbar-spacer" />
        </>
    );
};

export default Navbar;
