import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // 3-step state: 'email' → 'otp' → 'reset'
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpRefs = useRef([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendCooldown]);

    // ── Step 1: Send OTP ──
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.forgotPassword(email);
            setStep('otp');
            setSuccess('OTP sent to your email! Check your inbox.');
            setResendCooldown(60);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── OTP input handlers ──
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        setError('');
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    // ── Step 2: Verify OTP ──
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.verifyOTP(email, otpString);
            setStep('reset');
            setSuccess('OTP verified! Set your new password.');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Reset Password ──
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.resetPassword(email, otp.join(''), newPassword);
            setSuccess('Password reset successfully! Redirecting to login…');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ──
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setError('');
        try {
            await authService.forgotPassword(email);
            setSuccess('New OTP sent to your email!');
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { key: 'email', label: 'Email', num: 1 },
        { key: 'otp', label: 'Verify', num: 2 },
        { key: 'reset', label: 'Reset', num: 3 },
    ];
    const activeIdx = steps.findIndex((s) => s.key === step);

    return (
        <div className="fp-page">
            {/* Background effects */}
            <div className="fp-bg-gradient" />
            <div className="fp-grid-pattern" />
            <div className="fp-orb fp-orb-1" />
            <div className="fp-orb fp-orb-2" />

            <div className="fp-card">
                {/* Logo / Back link */}
                <Link to="/login" className="fp-back-link">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                </Link>

                {/* Header */}
                <div className="fp-header">
                    <div className="fp-icon-wrap">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="fp-title">Reset Password</h1>
                    <p className="fp-subtitle">
                        {step === 'email' && "Enter your email to receive a one-time password."}
                        {step === 'otp' && "Enter the 6-digit code sent to your email."}
                        {step === 'reset' && "Choose a new password for your account."}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="fp-steps">
                    {steps.map((s, i) => (
                        <div key={s.key} className={`fp-step ${i <= activeIdx ? 'fp-step-active' : ''} ${i < activeIdx ? 'fp-step-done' : ''}`}>
                            <div className="fp-step-circle">
                                {i < activeIdx ? (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : s.num}
                            </div>
                            <span className="fp-step-label">{s.label}</span>
                            {i < steps.length - 1 && <div className={`fp-step-line ${i < activeIdx ? 'fp-step-line-done' : ''}`} />}
                        </div>
                    ))}
                </div>

                {/* Messages */}
                {error && (
                    <div className="fp-msg fp-msg-error">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="fp-msg fp-msg-success">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {success}
                    </div>
                )}

                {/* ── Step 1: Email ── */}
                {step === 'email' && (
                    <form onSubmit={handleSendOTP} className="fp-form">
                        <div className="fp-field">
                            <label className="fp-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                required
                                className="fp-input"
                                placeholder="you@example.com"
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={loading} className="fp-btn">
                            {loading ? (<><div className="fp-spinner" /> Sending OTP…</>) : 'Send OTP Code'}
                        </button>
                    </form>
                )}

                {/* ── Step 2: OTP ── */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="fp-form">
                        <div className="fp-field">
                            <label className="fp-label">Enter OTP Code</label>
                            <div className="fp-otp-row" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (otpRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="fp-otp-input"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                            <p className="fp-otp-hint">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendCooldown > 0 || loading}
                                    className="fp-resend-btn"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                </button>
                            </p>
                        </div>
                        <button type="submit" disabled={loading} className="fp-btn">
                            {loading ? (<><div className="fp-spinner" /> Verifying…</>) : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {/* ── Step 3: New Password ── */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="fp-form">
                        <div className="fp-field">
                            <label className="fp-label">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                required
                                minLength={6}
                                className="fp-input"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        <div className="fp-field">
                            <label className="fp-label">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                required
                                className="fp-input"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="fp-btn">
                            {loading ? (<><div className="fp-spinner" /> Resetting…</>) : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
