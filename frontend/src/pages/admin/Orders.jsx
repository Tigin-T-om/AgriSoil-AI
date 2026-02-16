import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import './Orders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

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
        setUpdatingStatus(orderId);
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            alert('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Get the items array — backend returns "order_items"
    const getItems = (order) => order.order_items || order.items || [];

    const getStatusBadgeClass = (status) => {
        const map = {
            pending: 'ao-badge-yellow',
            confirmed: 'ao-badge-blue',
            processing: 'ao-badge-purple',
            shipped: 'ao-badge-cyan',
            delivered: 'ao-badge-green',
            cancelled: 'ao-badge-red',
        };
        return map[status] || 'ao-badge-yellow';
    };

    const getPaymentBadgeClass = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
            case 'paid': return 'ao-badge-green';
            case 'failed': return 'ao-badge-red';
            case 'refunded': return 'ao-badge-blue';
            default: return 'ao-badge-yellow';
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳', confirmed: '✓', processing: '⚙️',
            shipped: '🚚', delivered: '✅', cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    const getPaymentIcon = (ps) => {
        switch (ps?.toLowerCase()) {
            case 'paid': return '💳';
            case 'failed': return '⚠️';
            case 'refunded': return '↩️';
            default: return '⏳';
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    // Summary stats
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

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
                    <div className="ao-stats-grid">
                        <div className="ao-stat-card">
                            <div className="ao-stat-icon ao-stat-icon-blue">🛒</div>
                            <div className="ao-stat-value">{orders.length}</div>
                            <div className="ao-stat-label">Total Orders</div>
                        </div>
                        <div className="ao-stat-card">
                            <div className="ao-stat-icon ao-stat-icon-yellow">⏳</div>
                            <div className="ao-stat-value">{pendingCount}</div>
                            <div className="ao-stat-label">Pending</div>
                        </div>
                        <div className="ao-stat-card">
                            <div className="ao-stat-icon ao-stat-icon-cyan">🚚</div>
                            <div className="ao-stat-value">{shippedCount}</div>
                            <div className="ao-stat-label">Shipped</div>
                        </div>
                        <div className="ao-stat-card">
                            <div className="ao-stat-icon ao-stat-icon-green">✅</div>
                            <div className="ao-stat-value">{deliveredCount}</div>
                            <div className="ao-stat-label">Delivered</div>
                        </div>
                        <div className="ao-stat-card">
                            <div className="ao-stat-icon ao-stat-icon-purple">💰</div>
                            <div className="ao-stat-value">₹{totalRevenue.toLocaleString()}</div>
                            <div className="ao-stat-label">Revenue (Paid)</div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="ao-empty">
                            <div className="ao-empty-icon">📦</div>
                            <h3 className="ao-empty-title">No orders yet</h3>
                            <p className="ao-empty-text">Orders will appear here when customers place them</p>
                        </div>
                    ) : (
                        <div className="ao-orders-list">
                            {orders.map((order) => {
                                const items = getItems(order);
                                const isExpanded = expandedOrder === order.id;
                                const isUpdating = updatingStatus === order.id;

                                return (
                                    <div key={order.id} className={`ao-order-card ${isExpanded ? 'ao-order-card-expanded' : ''}`}>
                                        {/* Order Row */}
                                        <div className="ao-order-row" onClick={() => toggleExpand(order.id)}>
                                            {/* Order ID + Date */}
                                            <div className="ao-order-primary">
                                                <div className="ao-order-id">#{order.id}</div>
                                                <div className="ao-order-date">{formatDate(order.created_at)}</div>
                                            </div>

                                            {/* Customer */}
                                            <div className="ao-order-customer">
                                                <div className="ao-customer-avatar">
                                                    {(order.user?.full_name || order.user?.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="ao-customer-name">
                                                        {order.user?.full_name || order.user?.username || 'Unknown'}
                                                    </div>
                                                    <div className="ao-customer-email">{order.user?.email || ''}</div>
                                                </div>
                                            </div>

                                            {/* Items Count */}
                                            <div className="ao-order-items-count">
                                                <span className="ao-items-number">{items.length}</span>
                                                <span className="ao-items-label">{items.length === 1 ? 'item' : 'items'}</span>
                                            </div>

                                            {/* Total */}
                                            <div className="ao-order-total">
                                                ₹{order.total_amount?.toFixed(2)}
                                            </div>

                                            {/* Payment Status */}
                                            <div className={`ao-badge ${getPaymentBadgeClass(order.payment_status)}`}>
                                                <span>{getPaymentIcon(order.payment_status)}</span>
                                                <span>{order.payment_status || 'pending'}</span>
                                            </div>

                                            {/* Order Status Dropdown */}
                                            <div className="ao-status-cell" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`ao-status-select ${getStatusBadgeClass(order.status)}`}
                                                    disabled={isUpdating}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isUpdating && <div className="ao-status-spinner" />}
                                            </div>

                                            {/* Expand Arrow */}
                                            <div className={`ao-expand-arrow ${isExpanded ? 'ao-expand-arrow-open' : ''}`}>
                                                ▾
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="ao-expanded">
                                                <div className="ao-expanded-grid">
                                                    {/* Items Ordered */}
                                                    <div className="ao-detail-card ao-detail-card-full">
                                                        <h4 className="ao-detail-title">📋 Items Ordered</h4>
                                                        <div className="ao-items-table">
                                                            <div className="ao-items-header">
                                                                <span>Product</span>
                                                                <span>Qty</span>
                                                                <span>Price</span>
                                                                <span>Total</span>
                                                            </div>
                                                            {items.map((item, i) => (
                                                                <div key={i} className="ao-items-row">
                                                                    <div className="ao-item-product">
                                                                        <span className="ao-item-emoji">🌱</span>
                                                                        <span>{item.product?.name || `Product #${item.product_id}`}</span>
                                                                    </div>
                                                                    <span className="ao-item-qty">{item.quantity}</span>
                                                                    <span className="ao-item-price">₹{item.price?.toFixed(2)}</span>
                                                                    <span className="ao-item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Shipping Info */}
                                                    <div className="ao-detail-card">
                                                        <h4 className="ao-detail-title">📍 Shipping Address</h4>
                                                        <p className="ao-detail-text">{order.shipping_address || 'Not provided'}</p>
                                                        {order.phone_number && (
                                                            <p className="ao-detail-sub">📞 {order.phone_number}</p>
                                                        )}
                                                        {order.notes && (
                                                            <p className="ao-detail-sub">📝 {order.notes}</p>
                                                        )}
                                                    </div>

                                                    {/* Payment Info */}
                                                    <div className="ao-detail-card">
                                                        <h4 className="ao-detail-title">💳 Payment Info</h4>
                                                        <div className="ao-payment-info">
                                                            <div className="ao-payment-row">
                                                                <span>Status</span>
                                                                <span className={`ao-badge-inline ${getPaymentBadgeClass(order.payment_status)}`}>
                                                                    {order.payment_status || 'pending'}
                                                                </span>
                                                            </div>
                                                            <div className="ao-payment-row">
                                                                <span>Amount</span>
                                                                <span className="ao-payment-amount">₹{order.total_amount?.toFixed(2)}</span>
                                                            </div>
                                                            {order.razorpay_payment_id && (
                                                                <div className="ao-payment-row">
                                                                    <span>Txn ID</span>
                                                                    <span className="ao-payment-txn">{order.razorpay_payment_id}</span>
                                                                </div>
                                                            )}
                                                            {order.razorpay_order_id && (
                                                                <div className="ao-payment-row">
                                                                    <span>Order ID</span>
                                                                    <span className="ao-payment-txn">{order.razorpay_order_id}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
