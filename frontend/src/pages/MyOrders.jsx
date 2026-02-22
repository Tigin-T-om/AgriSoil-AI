import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

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

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳', confirmed: '✓', processing: '⚙️',
            shipped: '🚚', delivered: '✅', cancelled: '❌'
        };
        return icons[status?.toLowerCase()] || '📋';
    };

    const getStatusClass = (status) => {
        return `order-status-${status?.toLowerCase() || 'pending'}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const getOrderTitle = (order) => {
        const items = order.order_items || [];
        if (items.length === 0) return `Order #${order.id}`;
        const firstName = items[0]?.product?.name || `Product #${items[0]?.product_id}`;
        if (items.length === 1) return firstName;
        return `${firstName} + ${items.length - 1} more`;
    };

    const getActiveStep = (status) => {
        if (status === 'cancelled') return -1;
        return STATUS_STEPS.indexOf(status?.toLowerCase());
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
                    <div className="orders-empty">
                        <div className="orders-empty-icon"><span>📦</span></div>
                        <h2 className="orders-empty-title">No orders yet</h2>
                        <p className="orders-empty-text">Start shopping to see your orders here</p>
                        <Link to="/shop" className="orders-empty-btn">
                            <span>🛍️</span><span>Browse Products</span>
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const isExpanded = expandedOrder === order.id;
                            const activeStep = getActiveStep(order.status);
                            const isCancelled = order.status?.toLowerCase() === 'cancelled';

                            return (
                                <div key={order.id} className={`order-card ${isExpanded ? 'order-card-expanded' : ''}`}>
                                    {/* Clickable Header */}
                                    <div className="order-header" onClick={() => toggleOrder(order.id)}>
                                        <div className="order-info">
                                            <div className="order-icon">📦</div>
                                            <div>
                                                <h3 className="order-id">{getOrderTitle(order)}</h3>
                                                <p className="order-date">
                                                    Order #{order.id} • {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="order-header-right">
                                            <div className={`order-status ${getStatusClass(order.status)}`}>
                                                <span>{getStatusIcon(order.status)}</span>
                                                <span>{order.status}</span>
                                            </div>
                                            <div className={`order-expand-icon ${isExpanded ? 'order-expand-open' : ''}`}>
                                                ▾
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Content */}
                                    {isExpanded && (
                                        <div className="order-details">
                                            {/* Status Tracker */}
                                            {!isCancelled ? (
                                                <div className="order-tracker">
                                                    <div className="order-tracker-label">Order Progress</div>
                                                    <div className="order-tracker-steps">
                                                        {STATUS_STEPS.map((step, index) => (
                                                            <div key={step} className={`tracker-step ${index <= activeStep ? 'tracker-step-active' : ''} ${index === activeStep ? 'tracker-step-current' : ''}`}>
                                                                <div className="tracker-dot">
                                                                    {index < activeStep ? '✓' : index === activeStep ? getStatusIcon(step) : ''}
                                                                </div>
                                                                <span className="tracker-label">{step}</span>
                                                                {index < STATUS_STEPS.length - 1 && (
                                                                    <div className={`tracker-line ${index < activeStep ? 'tracker-line-active' : ''}`} />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="order-cancelled-banner">
                                                    <span>❌</span> This order has been cancelled
                                                </div>
                                            )}

                                            {/* Product Items */}
                                            <div className="order-items">
                                                <div className="order-items-label">Items Ordered</div>
                                                <div className="order-items-list">
                                                    {order.order_items?.map((item, i) => (
                                                        <div key={i} className="order-item">
                                                            <div className="order-item-info">
                                                                {item.product?.image_url ? (
                                                                    <img src={item.product.image_url} alt={item.product.name} className="order-item-img" />
                                                                ) : (
                                                                    <div className="order-item-icon">🌱</div>
                                                                )}
                                                                <div>
                                                                    <p className="order-item-name">
                                                                        {item.product?.name || `Product #${item.product_id}`}
                                                                    </p>
                                                                    {item.product?.category && (
                                                                        <p className="order-item-category">{item.product.category}</p>
                                                                    )}
                                                                    <p className="order-item-qty">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <p className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Footer */}
                                            <div className="order-footer">
                                                <div className="order-footer-meta">
                                                    <span className="order-items-count">
                                                        {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    {order.payment_status && (
                                                        <span className={`order-payment-badge order-payment-${order.payment_status}`}>
                                                            {order.payment_status === 'paid' ? '💳 Paid' : order.payment_status}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="order-total-label">Total:</span>
                                                    <span className="order-total-value">₹{order.total_amount?.toFixed(2)}</span>
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
