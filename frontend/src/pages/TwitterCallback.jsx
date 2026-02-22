import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Handles the OAuth callback from Twitter/X.
 * Twitter redirects here with ?code=...&state=...
 * We exchange the code for a JWT token via our backend.
 */
const TwitterCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { twitterLogin } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        const codeVerifier = sessionStorage.getItem('twitter_code_verifier');

        if (!code) {
            setError('No authorization code received from Twitter.');
            return;
        }

        if (!codeVerifier) {
            setError('Missing code verifier. Please try logging in again.');
            return;
        }

        (async () => {
            try {
                const result = await twitterLogin(code, codeVerifier);
                sessionStorage.removeItem('twitter_code_verifier');
                sessionStorage.removeItem('twitter_state');
                if (result.user?.is_admin) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                console.error('Twitter login error:', err);
                setError(err.response?.data?.detail || 'Twitter login failed. Please try again.');
                sessionStorage.removeItem('twitter_code_verifier');
                sessionStorage.removeItem('twitter_state');
            }
        })();
    }, []);

    if (error) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#020617', color: '#f87171', fontFamily: 'Inter, sans-serif', padding: '2rem',
                flexDirection: 'column', gap: '1rem',
            }}>
                <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '12px', padding: '24px 32px', maxWidth: '480px', textAlign: 'center',
                }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>❌ {error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(to right, #22c55e, #16a34a)', color: 'white',
                            fontWeight: 600, fontSize: '0.95rem',
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#020617', color: '#94a3b8', fontFamily: 'Inter, sans-serif',
            flexDirection: 'column', gap: '1rem',
        }}>
            <div style={{
                width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#22c55e',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            <p>Signing in with X…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TwitterCallback;
