import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService';
import './DeliveryLogin.css';

const DeliveryLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await deliveryService.login({ username, password });
            localStorage.setItem('access_token', response.access_token);

            // Fetch profile
            const profile = await deliveryService.getMyProfile();
            localStorage.setItem('delivery_staff', JSON.stringify(profile));

            // Clear any regular user data
            localStorage.removeItem('user');

            navigate('/delivery/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delivery-login-page">
            <div className="delivery-login-bg">
                <div className="delivery-login-glow glow-1" />
                <div className="delivery-login-glow glow-2" />
                <div className="delivery-login-glow glow-3" />
            </div>

            <div className="delivery-login-card">
                <div className="delivery-login-header">
                    <div className="delivery-login-icon">🚚</div>
                    <h1 className="delivery-login-title">Delivery Staff</h1>
                    <p className="delivery-login-subtitle">Sign in to your delivery dashboard</p>
                </div>

                {error && (
                    <div className="delivery-login-error">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="delivery-login-form">
                    <div className="delivery-form-group">
                        <label className="delivery-form-label">Username</label>
                        <div className="delivery-input-wrap">
                            <span className="delivery-input-icon">👤</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="delivery-input"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="delivery-form-group">
                        <label className="delivery-form-label">Password</label>
                        <div className="delivery-input-wrap">
                            <span className="delivery-input-icon">🔒</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="delivery-input"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="delivery-login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="delivery-btn-spinner" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>🚀</span>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="delivery-login-footer">
                    <Link to="/login" className="delivery-back-link">
                        ← Back to Customer Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLogin;
