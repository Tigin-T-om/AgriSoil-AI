import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import './Orders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusBadgeClass = (status) => {
        const map = {
            pending: 'admin-badge-yellow',
            confirmed: 'admin-badge-blue',
            processing: 'admin-badge-purple',
            shipped: 'admin-badge-cyan',
            delivered: 'admin-badge-green',
            cancelled: 'admin-badge-red',
        };
        return map[status] || 'admin-badge-yellow';
    };

    const getStatusSelectStyle = (status) => {
        const styles = {
            pending: { color: '#facc15', borderColor: 'rgba(250, 204, 21, 0.3)', background: 'rgba(250, 204, 21, 0.08)' },
            confirmed: { color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)', background: 'rgba(96, 165, 250, 0.08)' },
            processing: { color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.08)' },
            shipped: { color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.3)', background: 'rgba(34, 211, 238, 0.08)' },
            delivered: { color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.08)' },
            cancelled: { color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' },
        };
        return styles[status] || styles.pending;
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getOrderSummary = (order) => {
        const items = order.order_items || [];
        if (items.length === 0) return `${items.length} items`;
        const firstName = items[0]?.product?.name || `Product #${items[0]?.product_id}`;
        if (items.length === 1) return firstName;
        return `${firstName} +${items.length - 1}`;
    };

    // Summary stats
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return (
        <AdminLayout
            title="Orders"
            subtitle={`${orders.length} total orders`}
        >
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                </div>
            ) : (
                <>
                    {/* Quick Summary */}
                    <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-blue">🛒</div>
                            </div>
                            <div className="admin-stat-value">{orders.length}</div>
                            <div className="admin-stat-label">Total Orders</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-orange">⏳</div>
                            </div>
                            <div className="admin-stat-value">{pendingCount}</div>
                            <div className="admin-stat-label">Pending</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-green">✅</div>
                            </div>
                            <div className="admin-stat-value">{deliveredCount}</div>
                            <div className="admin-stat-label">Delivered</div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-top">
                                <div className="admin-stat-icon admin-stat-icon-purple">💰</div>
                            </div>
                            <div className="admin-stat-value">₹{totalRevenue.toLocaleString()}</div>
                            <div className="admin-stat-label">Total Revenue</div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    {orders.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📦</div>
                            <h3 className="admin-empty-title">No orders yet</h3>
                            <p className="admin-empty-text">Orders will appear here when customers place them</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <div className="admin-table-scroll">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '2.5rem' }}></th>
                                            <th>Order</th>
                                            <th>Customer</th>
                                            <th>Products</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <>
                                                <tr key={order.id} className={`admin-order-row ${expandedOrder === order.id ? 'admin-order-row-expanded' : ''}`}>
                                                    <td>
                                                        <button
                                                            className={`admin-expand-btn ${expandedOrder === order.id ? 'admin-expand-btn-open' : ''}`}
                                                            onClick={() => toggleOrder(order.id)}
                                                            title="View details"
                                                        >
                                                            ▾
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: '#fff' }}>#{order.id}</span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="admin-cell-title">
                                                                {order.user?.full_name || order.user?.username || 'Unknown'}
                                                            </div>
                                                            <div className="admin-cell-sub">{order.user?.email}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="admin-cell-title">{getOrderSummary(order)}</div>
                                                        <div className="admin-cell-sub">{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}</div>
                                                    </td>
                                                    <td className="admin-cell-price">₹{order.total_amount?.toFixed(2)}</td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className="admin-status-select"
                                                            style={getStatusSelectStyle(order.status)}
                                                        >
                                                            {statusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td style={{ color: 'var(--dark-400)' }}>
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                </tr>

                                                {/* Expanded Row */}
                                                {expandedOrder === order.id && (
                                                    <tr key={`${order.id}-details`} className="admin-order-detail-row">
                                                        <td colSpan="7">
                                                            <div className="admin-order-detail">
                                                                {/* Products */}
                                                                <div className="admin-detail-section">
                                                                    <div className="admin-detail-label">Products</div>
                                                                    <div className="admin-detail-items">
                                                                        {order.order_items?.map((item, i) => (
                                                                            <div key={i} className="admin-detail-item">
                                                                                {item.product?.image_url ? (
                                                                                    <img src={item.product.image_url} alt={item.product.name} className="admin-detail-item-img" />
                                                                                ) : (
                                                                                    <div className="admin-detail-item-icon">🌱</div>
                                                                                )}
                                                                                <div className="admin-detail-item-info">
                                                                                    <div className="admin-detail-item-name">
                                                                                        {item.product?.name || `Product #${item.product_id}`}
                                                                                    </div>
                                                                                    {item.product?.category && (
                                                                                        <div className="admin-detail-item-cat">{item.product.category}</div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="admin-detail-item-qty">×{item.quantity}</div>
                                                                                <div className="admin-detail-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Shipping & Payment */}
                                                                <div className="admin-detail-grid">
                                                                    <div className="admin-detail-section">
                                                                        <div className="admin-detail-label">📍 Shipping Address</div>
                                                                        <div className="admin-detail-value">{order.shipping_address || 'Not provided'}</div>
                                                                        {order.phone_number && (
                                                                            <div className="admin-detail-value" style={{ marginTop: '0.25rem', color: '#64748b' }}>
                                                                                📞 {order.phone_number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="admin-detail-section">
                                                                        <div className="admin-detail-label">💳 Payment</div>
                                                                        <div className="admin-detail-value">
                                                                            Status: <span className={`admin-payment-tag admin-payment-${order.payment_status || 'pending'}`}>
                                                                                {order.payment_status || 'pending'}
                                                                            </span>
                                                                        </div>
                                                                        {order.razorpay_payment_id && (
                                                                            <div className="admin-detail-value" style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                                                ID: {order.razorpay_payment_id}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {order.notes && (
                                                                        <div className="admin-detail-section">
                                                                            <div className="admin-detail-label">📝 Notes</div>
                                                                            <div className="admin-detail-value">{order.notes}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
