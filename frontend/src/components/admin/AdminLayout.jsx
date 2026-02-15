import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const sidebarLinks = [
    {
        section: 'Overview', items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        ]
    },
    {
        section: 'Management', items: [
            { path: '/admin/products', label: 'Products', icon: '📦' },
            { path: '/admin/orders', label: 'Orders', icon: '🛒' },
            { path: '/admin/users', label: 'Users', icon: '👥' },
        ]
    },
];

const AdminLayout = ({ children, title, subtitle, actions }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const SidebarContent = ({ onNavClick }) => (
        <>
            {sidebarLinks.map((group) => (
                <div key={group.section} className="admin-sidebar-section">
                    <div className="admin-sidebar-label">{group.section}</div>
                    <nav className="admin-sidebar-nav">
                        {group.items.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onNavClick}
                                className={`admin-sidebar-link ${isActive(link.path) ? 'admin-sidebar-link-active' : ''}`}
                            >
                                <span className="admin-sidebar-icon">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            ))}
        </>
    );

    return (
        <div className="admin-root">
            {/* ===== Top Bar ===== */}
            <header className="admin-topbar">
                <div className="admin-topbar-inner">
                    <div className="admin-topbar-left">
                        <button className="admin-topbar-toggle" onClick={() => setMobileOpen(true)}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <Link to="/admin/dashboard" className="admin-topbar-brand">
                            <div className="admin-topbar-logo">⚡</div>
                            <span className="admin-topbar-title">
                                Agro<span>Nova</span>
                            </span>
                            <span className="admin-topbar-badge">Admin</span>
                        </Link>
                    </div>

                    <div className="admin-topbar-right">
                        <Link to="/" className="admin-topbar-link admin-topbar-link-site">
                            <span>🌐</span>
                            <span>View Site</span>
                        </Link>

                        <div className="admin-topbar-user">
                            <div className="admin-topbar-avatar">
                                {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="admin-topbar-username">
                                {user?.full_name?.split(' ')[0] || user?.username || 'Admin'}
                            </span>
                        </div>

                        <button onClick={handleLogout} className="admin-topbar-logout">
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== Body ===== */}
            <div className="admin-body">
                {/* Desktop Sidebar */}
                <aside className="admin-sidebar">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar Overlay */}
                <div
                    className={`admin-mobile-overlay ${mobileOpen ? 'is-open' : ''}`}
                    onClick={() => setMobileOpen(false)}
                />
                <div className={`admin-mobile-sidebar ${mobileOpen ? 'is-open' : ''}`}>
                    <div className="admin-mobile-sidebar-header">
                        <Link to="/admin/dashboard" className="admin-topbar-brand" onClick={() => setMobileOpen(false)}>
                            <div className="admin-topbar-logo">⚡</div>
                            <span className="admin-topbar-title">
                                Agro<span>Nova</span>
                            </span>
                        </Link>
                        <button className="admin-mobile-sidebar-close" onClick={() => setMobileOpen(false)}>✕</button>
                    </div>
                    <SidebarContent onNavClick={() => setMobileOpen(false)} />
                </div>

                {/* Main Content */}
                <main className="admin-content">
                    {/* Page Header */}
                    {title && (
                        <div className="admin-page-header">
                            <div className="admin-page-header-row">
                                <div>
                                    <h1 className="admin-page-title">{title}</h1>
                                    {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
                                </div>
                                {actions && <div className="admin-page-actions">{actions}</div>}
                            </div>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
