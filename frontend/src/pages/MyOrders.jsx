import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Get the items array — backend returns "order_items"
    const getItems = (order) => order.order_items || order.items || [];

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'order-status-pending';
            case 'confirmed': return 'order-status-confirmed';
            case 'processing': return 'order-status-processing';
            case 'shipped': return 'order-status-shipped';
            case 'delivered': return 'order-status-delivered';
            case 'cancelled': return 'order-status-cancelled';
            default: return 'order-status-pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '⏳';
            case 'confirmed': return '✓';
            case 'processing': return '⚙️';
            case 'shipped': return '🚚';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'processing': return 'Processing';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const getPaymentStatusClass = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
            case 'paid': return 'payment-status-paid';
            case 'failed': return 'payment-status-failed';
            case 'refunded': return 'payment-status-refunded';
            default: return 'payment-status-pending';
        }
    };

    const getPaymentStatusIcon = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
            case 'paid': return '💳';
            case 'failed': return '⚠️';
            case 'refunded': return '↩️';
            default: return '⏳';
        }
    };

    const getPaymentStatusLabel = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
            case 'paid': return 'Paid';
            case 'failed': return 'Payment Failed';
            case 'refunded': return 'Refunded';
            default: return 'Payment Pending';
        }
    };

    // Order status timeline steps
    const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    const getStepIndex = (status) => {
        if (status === 'cancelled') return -1;
        return statusSteps.indexOf(status?.toLowerCase());
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryIcon = (category) => {
        const icons = { seeds: '🌱', crops: '🌾', fertilizers: '🧪', tools: '🔧' };
        return icons[category] || '📦';
    };

    return (
        <div className="orders-page">
            <Navbar />

            <div className="orders-container">
                {/* Header */}
                <div className="orders-header">
                    <div>
                        <h1 className="orders-title">My Orders</h1>
                        <p className="orders-subtitle">Track and manage your orders</p>
                    </div>
                    <Link to="/shop" className="orders-shop-link">
                        🛍️ Continue Shopping
                    </Link>
                </div>

                {loading ? (
                    /* Loading Skeleton */
                    <div className="orders-skeleton">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="orders-skeleton-card">
                                <div className="orders-skeleton-header">
                                    <div className="orders-skeleton-line orders-skeleton-line-sm" />
                                    <div className="orders-skeleton-line orders-skeleton-line-md" />
                                </div>
                                <div className="orders-skeleton-line orders-skeleton-line-lg" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <div className="orders-empty">
                        <div className="orders-empty-icon">
                            <span>📦</span>
                        </div>
                        <h2 className="orders-empty-title">No orders yet</h2>
                        <p className="orders-empty-text">Start shopping to see your orders here</p>
                        <Link to="/shop" className="orders-empty-btn">
                            <span>🛍️</span>
                            <span>Browse Products</span>
                        </Link>
                    </div>
                ) : (
                    /* Orders List */
                    <div className="orders-list">
                        {orders.map((order) => {
                            const items = getItems(order);
                            const isExpanded = expandedOrder === order.id;
                            const currentStepIndex = getStepIndex(order.status);
                            const isCancelled = order.status?.toLowerCase() === 'cancelled';

                            return (
                                <div
                                    key={order.id}
                                    className={`order-card ${isExpanded ? 'order-card-expanded' : ''}`}
                                >
                                    {/* Order Header — Clickable */}
                                    <div
                                        className="order-header"
                                        onClick={() => toggleExpand(order.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="order-info">
                                            {/* Product Image Thumbnail */}
                                            <div className="order-product-thumb">
                                                {items.length > 0 && items[0].product?.image_url ? (
                                                    <img
                                                        src={items[0].product.image_url}
                                                        alt={items[0].product?.name}
                                                        className="order-product-img"
                                                    />
                                                ) : (
                                                    <div className="order-product-img-placeholder">
                                                        {getCategoryIcon(items[0]?.product?.category)}
                                                    </div>
                                                )}
                                                {items.length > 1 && (
                                                    <div className="order-product-count">+{items.length - 1}</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="order-product-name">
                                                    {items.length > 0
                                                        ? items[0].product?.name || `Product #${items[0].product_id}`
                                                        : 'No items'}
                                                    {items.length > 1 && (
                                                        <span className="order-more-text">
                                                            {' '}& {items.length - 1} more
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="order-date">
                                                    Order #{order.id} · {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="order-header-right">
                                            {/* Payment Status */}
                                            <div className={`order-payment-status ${getPaymentStatusClass(order.payment_status)}`}>
                                                <span>{getPaymentStatusIcon(order.payment_status)}</span>
                                                <span>{getPaymentStatusLabel(order.payment_status)}</span>
                                            </div>

                                            {/* Order Status */}
                                            <div className={`order-status ${getStatusClass(order.status)}`}>
                                                <span>{getStatusIcon(order.status)}</span>
                                                <span>{getStatusLabel(order.status)}</span>
                                            </div>

                                            {/* Expand Arrow */}
                                            <div className={`order-expand-arrow ${isExpanded ? 'order-expand-arrow-open' : ''}`}>
                                                ▾
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary (always visible) */}
                                    <div className="order-quick-summary">
                                        <span className="order-items-count">
                                            {items.length} {items.length === 1 ? 'item' : 'items'}
                                        </span>
                                        <div>
                                            <span className="order-total-label">Total:</span>
                                            <span className="order-total-value">₹{order.total_amount?.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="order-details">
                                            {/* Status Timeline */}
                                            {!isCancelled && (
                                                <div className="order-timeline">
                                                    <h4 className="order-section-title">Order Status</h4>
                                                    <div className="timeline-track">
                                                        {statusSteps.map((step, index) => {
                                                            const isCompleted = index <= currentStepIndex;
                                                            const isCurrent = index === currentStepIndex;
                                                            return (
                                                                <div
                                                                    key={step}
                                                                    className={`timeline-step ${isCompleted ? 'timeline-step-done' : ''} ${isCurrent ? 'timeline-step-current' : ''}`}
                                                                >
                                                                    <div className="timeline-dot">
                                                                        {isCompleted ? '✓' : (index + 1)}
                                                                    </div>
                                                                    <span className="timeline-label">{getStatusLabel(step)}</span>
                                                                    {index < statusSteps.length - 1 && (
                                                                        <div className={`timeline-line ${isCompleted && index < currentStepIndex ? 'timeline-line-done' : ''}`} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {isCancelled && (
                                                <div className="order-cancelled-notice">
                                                    <span>❌</span>
                                                    <span>This order has been cancelled</span>
                                                </div>
                                            )}

                                            {/* Order Items */}
                                            <div className="order-items-section">
                                                <h4 className="order-section-title">Items Ordered</h4>
                                                <div className="order-items-list">
                                                    {items.map((item, i) => (
                                                        <div key={i} className="order-item">
                                                            <div className="order-item-info">
                                                                <div className="order-item-icon">🌱</div>
                                                                <div>
                                                                    <p className="order-item-name">
                                                                        {item.product?.name || `Product #${item.product_id}`}
                                                                    </p>
                                                                    <p className="order-item-qty">
                                                                        Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="order-item-price">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping & Payment Info */}
                                            <div className="order-info-grid">
                                                <div className="order-info-card">
                                                    <h4 className="order-info-card-title">📍 Shipping Address</h4>
                                                    <p className="order-info-card-text">
                                                        {order.shipping_address || 'Not provided'}
                                                    </p>
                                                    {order.phone_number && (
                                                        <p className="order-info-card-sub">📞 {order.phone_number}</p>
                                                    )}
                                                </div>

                                                <div className="order-info-card">
                                                    <h4 className="order-info-card-title">💳 Payment Info</h4>
                                                    <p className="order-info-card-text">
                                                        <span className={`order-payment-badge ${getPaymentStatusClass(order.payment_status)}`}>
                                                            {getPaymentStatusLabel(order.payment_status)}
                                                        </span>
                                                    </p>
                                                    {order.razorpay_payment_id && (
                                                        <p className="order-info-card-sub">
                                                            Txn: {order.razorpay_payment_id}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Order Total */}
                                            <div className="order-total-section">
                                                <div className="order-total-row">
                                                    <span>Subtotal</span>
                                                    <span>₹{(order.total_amount > 500 ? order.total_amount : order.total_amount - 50)?.toFixed(2)}</span>
                                                </div>
                                                <div className="order-total-row">
                                                    <span>Shipping</span>
                                                    <span>{order.total_amount > 500 ? <span className="order-free-shipping">Free</span> : '₹50.00'}</span>
                                                </div>
                                                <div className="order-total-row order-total-row-final">
                                                    <span>Total</span>
                                                    <span className="order-grand-total">₹{order.total_amount?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
