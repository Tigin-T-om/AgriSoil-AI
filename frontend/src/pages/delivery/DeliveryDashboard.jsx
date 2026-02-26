import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const [staff, setStaff] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ district: '', is_available: true, phone_number: '' });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileData, ordersData] = await Promise.all([
                deliveryService.getMyProfile(),
                deliveryService.getMyOrders(),
            ]);
            setStaff(profileData);
            setOrders(ordersData);
            setProfileForm({
                district: profileData.district || '',
                is_available: profileData.is_available,
                phone_number: profileData.phone_number || '',
            });
            localStorage.setItem('delivery_staff', JSON.stringify(profileData));
        } catch (err) {
            console.error('Failed to load data:', err);
            if (err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('delivery_staff');
        navigate('/delivery/login');
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await deliveryService.updateDeliveryStatus(orderId, { status: newStatus });
            await loadData();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to update status';
            alert(msg);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleProfileSave = async () => {
        try {
            const updated = await deliveryService.updateMyProfile(profileForm);
            setStaff(updated);
            localStorage.setItem('delivery_staff', JSON.stringify(updated));
            setEditingProfile(false);
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const getStatusColor = (status) => {
        const colors = {
            pending: '#facc15',
            confirmed: '#60a5fa',
            processing: '#c084fc',
            shipped: '#22d3ee',
            delivered: '#4ade80',
            cancelled: '#f87171',
        };
        return colors[status] || '#94a3b8';
    };

    const getNextAction = (status) => {
        if (status === 'confirmed' || status === 'processing') return { label: 'Mark Shipped', next: 'shipped' };
        if (status === 'shipped') return { label: 'Mark Delivered', next: 'delivered' };
        return null;
    };

    // Stats
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const shippedOrders = orders.filter(o => o.status === 'shipped');

    if (loading) {
        return (
            <div className="dd-page">
                <div className="dd-loading">
                    <div className="dd-loading-spinner" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dd-page">
            {/* Header */}
            <header className="dd-header">
                <div className="dd-header-inner">
                    <div className="dd-header-left">
                        <div className="dd-logo">
                            <span className="dd-logo-icon">🚚</span>
                            <div>
                                <span className="dd-logo-title">Agri-Soil <span>Delivery</span></span>
                                <span className="dd-logo-badge">Staff Panel</span>
                            </div>
                        </div>
                    </div>
                    <div className="dd-header-right">
                        <div className="dd-header-user">
                            <div className="dd-header-avatar">
                                {staff?.full_name?.charAt(0).toUpperCase() || 'D'}
                            </div>
                            <span className="dd-header-name">{staff?.full_name?.split(' ')[0] || 'Staff'}</span>
                        </div>
                        <button onClick={handleLogout} className="dd-logout-btn">
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dd-main">
                {/* Profile Card */}
                <div className="dd-profile-card">
                    <div className="dd-profile-top">
                        <div className="dd-profile-info">
                            <div className="dd-profile-avatar">
                                {staff?.full_name?.charAt(0).toUpperCase() || 'D'}
                            </div>
                            <div>
                                <h2 className="dd-profile-name">{staff?.full_name}</h2>
                                <p className="dd-profile-email">{staff?.email}</p>
                            </div>
                        </div>
                        <button
                            className="dd-edit-btn"
                            onClick={() => setEditingProfile(!editingProfile)}
                        >
                            {editingProfile ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {editingProfile ? (
                        <div className="dd-profile-edit">
                            <div className="dd-edit-row">
                                <div className="dd-edit-field">
                                    <label>District (Service Area)</label>
                                    <input
                                        type="text"
                                        value={profileForm.district}
                                        onChange={(e) => setProfileForm(p => ({ ...p, district: e.target.value }))}
                                        placeholder="e.g. Ernakulam"
                                    />
                                </div>
                                <div className="dd-edit-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone_number}
                                        onChange={(e) => setProfileForm(p => ({ ...p, phone_number: e.target.value }))}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                            <div className="dd-edit-row">
                                <label className="dd-toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={profileForm.is_available}
                                        onChange={(e) => setProfileForm(p => ({ ...p, is_available: e.target.checked }))}
                                    />
                                    <span className="dd-toggle-slider" />
                                    <span>Available for deliveries</span>
                                </label>
                            </div>
                            <button onClick={handleProfileSave} className="dd-save-btn">
                                💾 Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="dd-profile-details">
                            <div className="dd-detail-chip">
                                <span>📍</span> {staff?.district || 'Not set'}
                            </div>
                            <div className="dd-detail-chip">
                                <span>📞</span> {staff?.phone_number || 'Not set'}
                            </div>
                            <div className={`dd-detail-chip ${staff?.is_available ? 'dd-chip-available' : 'dd-chip-unavailable'}`}>
                                <span>{staff?.is_available ? '🟢' : '🔴'}</span>
                                {staff?.is_available ? 'Available' : 'Unavailable'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="dd-stats">
                    <div className="dd-stat-card dd-stat-active">
                        <div className="dd-stat-icon">📋</div>
                        <div className="dd-stat-value">{activeOrders.length}</div>
                        <div className="dd-stat-label">Active</div>
                    </div>
                    <div className="dd-stat-card dd-stat-shipped">
                        <div className="dd-stat-icon">🚚</div>
                        <div className="dd-stat-value">{shippedOrders.length}</div>
                        <div className="dd-stat-label">In Transit</div>
                    </div>
                    <div className="dd-stat-card dd-stat-delivered">
                        <div className="dd-stat-icon">✅</div>
                        <div className="dd-stat-value">{deliveredOrders.length}</div>
                        <div className="dd-stat-label">Delivered</div>
                    </div>
                    <div className="dd-stat-card dd-stat-total">
                        <div className="dd-stat-icon">📦</div>
                        <div className="dd-stat-value">{orders.length}</div>
                        <div className="dd-stat-label">Total</div>
                    </div>
                </div>

                {/* Orders */}
                <div className="dd-orders-section">
                    <h2 className="dd-section-title">Assigned Orders</h2>

                    {orders.length === 0 ? (
                        <div className="dd-empty">
                            <div className="dd-empty-icon">📭</div>
                            <h3>No orders assigned yet</h3>
                            <p>Orders will appear here when assigned by admin</p>
                        </div>
                    ) : (
                        <div className="dd-orders-list">
                            {orders.map((order) => {
                                const isExpanded = expandedOrder === order.id;
                                const action = getNextAction(order.status);

                                return (
                                    <div key={order.id} className={`dd-order-card ${isExpanded ? 'dd-order-expanded' : ''}`}>
                                        <div className="dd-order-header" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                            <div className="dd-order-left">
                                                <span className="dd-order-id">#{order.id}</span>
                                                <div className="dd-order-meta">
                                                    <span className="dd-order-customer">
                                                        {order.user?.full_name || order.user?.username || 'Customer'}
                                                    </span>
                                                    <span className="dd-order-date">{formatDate(order.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="dd-order-right">
                                                <span
                                                    className="dd-order-status"
                                                    style={{
                                                        color: getStatusColor(order.status),
                                                        borderColor: getStatusColor(order.status) + '40',
                                                        background: getStatusColor(order.status) + '12',
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                                <span className={`dd-expand-icon ${isExpanded ? 'dd-expand-open' : ''}`}>▾</span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="dd-order-body">
                                                {/* Shipping Info */}
                                                <div className="dd-info-grid">
                                                    <div className="dd-info-block">
                                                        <div className="dd-info-label">📍 Shipping Address</div>
                                                        <div className="dd-info-value">{order.shipping_address}</div>
                                                    </div>
                                                    {order.district && (
                                                        <div className="dd-info-block">
                                                            <div className="dd-info-label">🏘️ District</div>
                                                            <div className="dd-info-value">{order.district}</div>
                                                        </div>
                                                    )}
                                                    {order.phone_number && (
                                                        <div className="dd-info-block">
                                                            <div className="dd-info-label">📞 Contact</div>
                                                            <div className="dd-info-value">{order.phone_number}</div>
                                                        </div>
                                                    )}
                                                    <div className="dd-info-block">
                                                        <div className="dd-info-label">💰 Total</div>
                                                        <div className="dd-info-value dd-info-price">₹{order.total_amount?.toFixed(2)}</div>
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div className="dd-items">
                                                    <div className="dd-items-label">Items ({order.order_items?.length || 0})</div>
                                                    {order.order_items?.map((item, i) => (
                                                        <div key={i} className="dd-item">
                                                            {item.product?.image_url ? (
                                                                <img src={item.product.image_url} alt="" className="dd-item-img" />
                                                            ) : (
                                                                <div className="dd-item-placeholder">🌱</div>
                                                            )}
                                                            <div className="dd-item-info">
                                                                <span className="dd-item-name">{item.product?.name || `Product #${item.product_id}`}</span>
                                                                <span className="dd-item-qty">×{item.quantity}</span>
                                                            </div>
                                                            <span className="dd-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action Button */}
                                                {action && (
                                                    <div className="dd-action-bar">
                                                        <button
                                                            className={`dd-action-btn ${action.next === 'delivered' ? 'dd-action-delivered' : 'dd-action-shipped'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(order.id, action.next);
                                                            }}
                                                            disabled={updatingId === order.id}
                                                        >
                                                            {updatingId === order.id ? (
                                                                <span className="dd-btn-spinner" />
                                                            ) : (
                                                                <span>{action.next === 'delivered' ? '✅' : '🚚'}</span>
                                                            )}
                                                            {action.label}
                                                        </button>
                                                    </div>
                                                )}

                                                {order.status === 'delivered' && (
                                                    <div className="dd-delivered-badge">
                                                        <span>✅</span> Successfully Delivered
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeliveryDashboard;
