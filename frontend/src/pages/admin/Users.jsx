import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId) => {
        try {
            await userService.toggleAdminStatus(userId);
            fetchUsers();
        } catch (error) {
            alert('Failed to update user role');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await userService.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete user');
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const adminCount = users.filter(u => u.is_admin).length;
    const activeCount = users.filter(u => u.is_active).length;

    return (
        <AdminLayout
            title="Users"
            subtitle={`${users.length} registered users`}
        >
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                </div>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-blue">👥</div>
                            </div>
                            <div className="admin-stat-value">{users.length}</div>
                            <div className="admin-stat-label">Total Users</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-purple">⚡</div>
                            </div>
                            <div className="admin-stat-value">{adminCount}</div>
                            <div className="admin-stat-label">Admins</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-green">✅</div>
                            </div>
                            <div className="admin-stat-value">{activeCount}</div>
                            <div className="admin-stat-label">Active Users</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-orange">🌾</div>
                            </div>
                            <div className="admin-stat-value">{users.length - adminCount}</div>
                            <div className="admin-stat-label">Farmers</div>
                        </div>
                    </div>

                    {/* User Cards */}
                    {users.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">👥</div>
                            <h3 className="admin-empty-title">No users found</h3>
                            <p className="admin-empty-text">Users will appear here after they register</p>
                        </div>
                    ) : (
                        <div className="admin-users-grid">
                            {users.map((user) => (
                                <div key={user.id} className="admin-user-card">
                                    <div className="admin-user-card-top">
                                        <div className={`admin-user-avatar ${user.is_admin ? 'admin-user-avatar-admin' : 'admin-user-avatar-user'}`}>
                                            {(user.full_name || user.username)?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div className="admin-user-name">{user.full_name || user.username}</div>
                                            <div className="admin-user-email">{user.email}</div>
                                        </div>
                                    </div>

                                    <div className="admin-user-meta">
                                        <div className="admin-user-meta-item">
                                            <span>👤</span>
                                            <span>@{user.username}</span>
                                        </div>
                                        {user.phone_number && (
                                            <div className="admin-user-meta-item">
                                                <span>📱</span>
                                                <span>{user.phone_number}</span>
                                            </div>
                                        )}
                                        <div className="admin-user-meta-item">
                                            <span>📅</span>
                                            <span>Joined {formatDate(user.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="admin-user-card-footer">
                                        <div className="admin-user-badges">
                                            {user.is_admin ? (
                                                <span className="admin-badge admin-badge-purple">Admin</span>
                                            ) : (
                                                <span className="admin-badge admin-badge-blue">Farmer</span>
                                            )}
                                            {user.is_active && (
                                                <span className="admin-badge admin-badge-green">Active</span>
                                            )}
                                            {currentUser && currentUser.id === user.id && (
                                                <span className="admin-badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>You</span>
                                            )}
                                        </div>
                                        {currentUser && currentUser.id === user.id ? (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--dark-400)', fontStyle: 'italic' }}>
                                                Protected
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                <button
                                                    onClick={() => handleToggleAdmin(user.id)}
                                                    className={`admin-user-toggle-btn ${user.is_admin ? 'admin-user-toggle-remove' : 'admin-user-toggle-make'}`}
                                                >
                                                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="admin-btn-icon admin-btn-icon-delete"
                                                    title="Delete user"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
