import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const AuthPage = () => {
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/register';
    const [isLogin, setIsLogin] = useState(!isRegisterRoute);
    const [animating, setAnimating] = useState(false);

    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();

    // Login state
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Register state
    const [regData, setRegData] = useState({
        username: '', email: '', full_name: '', phone_number: '', password: '', confirmPassword: '',
    });
    const [regError, setRegError] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    // Sync with URL changes (back/forward button)
    useEffect(() => {
        const shouldBeLogin = location.pathname !== '/register';
        if (shouldBeLogin !== isLogin && !animating) {
            handleToggle(shouldBeLogin);
        }
    }, [location.pathname]);

    const handleToggle = (toLogin) => {
        if (isLogin === toLogin || animating) return;
        setAnimating(true);
        navigate(toLogin ? '/login' : '/register', { replace: true });
        setIsLogin(toLogin);
        setTimeout(() => setAnimating(false), 850);
    };

    // Login handlers
    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        setLoginError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        try {
            const result = await login({ username: loginData.username, password: loginData.password });
            if (result.user?.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setLoginError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    // Register handlers
    const handleRegChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
        setRegError('');
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) { setRegError('Passwords do not match'); return; }
        if (regData.password.length < 6) { setRegError('Password must be at least 6 characters'); return; }
        setRegLoading(true);
        setRegError('');
        try {
            await register({
                username: regData.username, email: regData.email,
                full_name: regData.full_name, phone_number: regData.phone_number, password: regData.password,
            });
            navigate('/');
        } catch (err) {
            setRegError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setRegLoading(false);
        }
    };

    // Google OAuth handler
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.user?.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Google login failed. Please try again.';
            if (isLogin) {
                setLoginError(errorMsg);
            } else {
                setRegError(errorMsg);
            }
        }
    };

    // Shared Social Buttons
    const SocialButtons = () => (
        <>
            <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or continue with</span>
                <div className="auth-divider-line" />
            </div>
            <div className="auth-social-buttons">
                <div className="auth-social-btn auth-social-google-wrap">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            const msg = 'Google login failed. Please try again.';
                            if (isLogin) setLoginError(msg);
                            else setRegError(msg);
                        }}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        width="100%"
                        text="continue_with"
                    />
                </div>
                <button type="button" className="auth-social-btn">
                    <svg className="auth-social-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                </button>
            </div>
        </>
    );

    return (
        <div className={`auth-page ${isLogin ? 'auth-mode-login' : 'auth-mode-register'}`}>

            {/* =============================================
          DECORATIVE PANEL – slides between left & right
          ============================================= */}
            <div className="auth-deco-panel">
                <div className="auth-bg-gradient" />
                <div className="auth-grid-pattern" />

                {/* Animated glow orbs */}
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />

                {/* Floating glass shapes */}
                <div className="auth-floating-box auth-floating-1" />
                <div className="auth-floating-box auth-floating-2" />
                <div className="auth-floating-box auth-floating-3" />

                {/* Login decorative content */}
                <div className={`auth-deco-content ${isLogin ? 'auth-deco-visible' : 'auth-deco-hidden'}`}>
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

                {/* Register decorative content */}
                <div className={`auth-deco-content ${!isLogin ? 'auth-deco-visible' : 'auth-deco-hidden'}`}>
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

            {/* =============================================
          FORM PANEL – slides between right & left
          ============================================= */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    {/* Logo for mobile */}
                    <Link to="/" className="auth-mobile-logo">
                        <div className="auth-mobile-logo-icon">🌱</div>
                        <span className="auth-mobile-logo-text">AgroNova</span>
                    </Link>

                    {isLogin ? (
                        /* ================= LOGIN FORM ================= */
                        <div className="auth-form-content" key="login">
                            <div className="auth-header">
                                <h2 className="auth-title">Welcome back</h2>
                                <p className="auth-subtitle">Sign in to your account to continue</p>
                            </div>

                            {loginError && (
                                <div className="auth-error">
                                    <svg className="auth-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {loginError}
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="auth-form">
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} required className="form-input" placeholder="Enter your username" />
                                </div>
                                <div className="form-group">
                                    <div className="form-label-row">
                                        <label className="form-label">Password</label>
                                        <a href="#" className="form-link">Forgot password?</a>
                                    </div>
                                    <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required className="form-input" placeholder="Enter your password" />
                                </div>
                                <button type="submit" disabled={loginLoading} className="auth-submit-btn">
                                    {loginLoading ? (<><div className="auth-spinner" /> Signing in...</>) : 'Sign In'}
                                </button>
                            </form>

                            <SocialButtons />

                            <p className="auth-footer-text">
                                Don't have an account?{' '}
                                <button type="button" onClick={() => handleToggle(false)} className="auth-footer-link auth-footer-link-btn">
                                    Sign up for free
                                </button>
                            </p>
                        </div>
                    ) : (
                        /* ================= REGISTER FORM ================= */
                        <div className="auth-form-content" key="register">
                            <div className="auth-header">
                                <h2 className="auth-title">Create Account</h2>
                                <p className="auth-subtitle">Join thousands of smart farmers today</p>
                            </div>

                            {regError && (
                                <div className="auth-error">
                                    <svg className="auth-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {regError}
                                </div>
                            )}

                            <form onSubmit={handleRegSubmit} className="auth-form">
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input type="text" name="username" value={regData.username} onChange={handleRegChange} required className="form-input" placeholder="Choose a username" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" name="full_name" value={regData.full_name} onChange={handleRegChange} className="form-input" placeholder="Enter your full name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" name="email" value={regData.email} onChange={handleRegChange} required className="form-input" placeholder="Enter your email" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" name="phone_number" value={regData.phone_number} onChange={handleRegChange} className="form-input" placeholder="+91 9876543210" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input type="password" name="password" value={regData.password} onChange={handleRegChange} required minLength={6} className="form-input" placeholder="••••••••" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm</label>
                                        <input type="password" name="confirmPassword" value={regData.confirmPassword} onChange={handleRegChange} required className="form-input" placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="auth-checkbox-group">
                                    <input type="checkbox" required className="auth-checkbox" />
                                    <span className="auth-checkbox-text">
                                        I agree to the <a href="#" className="form-link">Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>
                                    </span>
                                </div>
                                <button type="submit" disabled={regLoading} className="auth-submit-btn">
                                    {regLoading ? (<><div className="auth-spinner" /> Creating account...</>) : 'Create Account'}
                                </button>
                            </form>

                            <SocialButtons />

                            <p className="auth-footer-text">
                                Already have an account?{' '}
                                <button type="button" onClick={() => handleToggle(true)} className="auth-footer-link auth-footer-link-btn">
                                    Sign in
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
