import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { deliveryService } from '../../services/deliveryService';
import './DeliveryManage.css';

const DeliveryManage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        email: '', username: '', full_name: '', phone_number: '', district: '', password: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await deliveryService.getAllStaff();
            setStaff(data);
        } catch (err) {
            console.error('Failed to fetch delivery staff:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setCreating(true);
        try {
            await deliveryService.createStaff(form);
            setShowCreate(false);
            setForm({ email: '', username: '', full_name: '', phone_number: '', district: '', password: '' });
            fetchStaff();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create delivery staff');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await deliveryService.toggleStaffActive(id);
            fetchStaff();
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const activeCount = staff.filter(s => s.is_active).length;
    const availableCount = staff.filter(s => s.is_available && s.is_active).length;

    return (
        <AdminLayout
            title="Delivery Staff"
            subtitle={`${staff.length} staff members`}
            actions={
                <button className="admin-btn-primary" onClick={() => setShowCreate(!showCreate)}>
                    {showCreate ? '✕ Cancel' : '➕ Add Staff'}
                </button>
            }
        >
            {/* Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon admin-stat-icon-blue">👥</div>
                    </div>
                    <div className="admin-stat-value">{staff.length}</div>
                    <div className="admin-stat-label">Total Staff</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon admin-stat-icon-green">✅</div>
                    </div>
                    <div className="admin-stat-value">{activeCount}</div>
                    <div className="admin-stat-label">Active</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon admin-stat-icon-orange">🟢</div>
                    </div>
                    <div className="admin-stat-value">{availableCount}</div>
                    <div className="admin-stat-label">Available</div>
                </div>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="dm-create-card">
                    <h3 className="dm-create-title">Create New Delivery Staff</h3>
                    {error && <div className="dm-error">{error}</div>}
                    <form onSubmit={handleCreate} className="dm-create-form">
                        <div className="dm-form-grid">
                            <div className="dm-field">
                                <label>Full Name *</label>
                                <input
                                    type="text" required
                                    value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="dm-field">
                                <label>Username *</label>
                                <input
                                    type="text" required
                                    value={form.username}
                                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                    placeholder="johndoe"
                                />
                            </div>
                            <div className="dm-field">
                                <label>Email *</label>
                                <input
                                    type="email" required
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="dm-field">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    value={form.phone_number}
                                    onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="dm-field">
                                <label>District (Service Area) *</label>
                                <input
                                    type="text" required
                                    value={form.district}
                                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                                    placeholder="e.g. Ernakulam"
                                />
                            </div>
                            <div className="dm-field">
                                <label>Password *</label>
                                <input
                                    type="password" required
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Min 6 characters"
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <button type="submit" className="dm-create-btn" disabled={creating}>
                            {creating ? 'Creating...' : '✅ Create Staff'}
                        </button>
                    </form>
                </div>
            )}

            {/* Staff List */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                </div>
            ) : staff.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🚚</div>
                    <h3 className="admin-empty-title">No delivery staff yet</h3>
                    <p className="admin-empty-text">Add delivery staff to start assigning orders</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>District</th>
                                    <th>Status</th>
                                    <th>Workload</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 700, color: '#f97316' }}>#{s.id}</td>
                                        <td>
                                            <div className="admin-cell-title">{s.full_name}</div>
                                            <div className="admin-cell-sub">@{s.username}</div>
                                        </td>
                                        <td>
                                            <div className="admin-cell-title">{s.email}</div>
                                            <div className="admin-cell-sub">{s.phone_number || '—'}</div>
                                        </td>
                                        <td>
                                            <span className="dm-district-badge">📍 {s.district}</span>
                                        </td>
                                        <td>
                                            <div className="dm-status-badges">
                                                <span className={`dm-badge ${s.is_active ? 'dm-badge-active' : 'dm-badge-inactive'}`}>
                                                    {s.is_active ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                                <span className={`dm-badge ${s.is_available ? 'dm-badge-available' : 'dm-badge-unavailable'}`}>
                                                    {s.is_available ? '🟢 Available' : '🔴 Unavailable'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="dm-workload">
                                                <span className="dm-workload-count">{s.active_orders_count}</span>
                                                <span className="dm-workload-label">active orders</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`dm-toggle-btn ${s.is_active ? 'dm-toggle-deactivate' : 'dm-toggle-activate'}`}
                                                onClick={() => handleToggleActive(s.id)}
                                            >
                                                {s.is_active ? '🚫 Deactivate' : '✅ Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default DeliveryManage;
