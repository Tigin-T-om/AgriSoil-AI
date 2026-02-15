import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
        new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
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
                                                <td>{order.items?.length || 0} items</td>
                                                <td className="admin-cell-price">₹{order.total_amount?.toFixed(2)}</td>
                                                <td>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="admin-status-select"
                                                        style={getStatusSelectStyle(order.status)}
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ color: 'var(--dark-400)' }}>
                                                    {formatDate(order.created_at)}
                                                </td>
                                            </tr>
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
