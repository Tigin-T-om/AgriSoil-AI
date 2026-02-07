import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            case 'processing': return '📦';
            case 'shipped': return '🚚';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📋';
        }
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
                        Continue Shopping
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
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                {/* Order Header */}
                                <div className="order-header">
                                    <div className="order-info">
                                        <div className="order-icon">📦</div>
                                        <div>
                                            <h3 className="order-id">Order #{order.id}</h3>
                                            <p className="order-date">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className={`order-status ${getStatusClass(order.status)}`}>
                                        <span>{getStatusIcon(order.status)}</span>
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="order-items">
                                    <div className="order-items-list">
                                        {order.items?.slice(0, 3).map((item, i) => (
                                            <div key={i} className="order-item">
                                                <div className="order-item-info">
                                                    <div className="order-item-icon">🌱</div>
                                                    <div>
                                                        <p className="order-item-name">{item.product?.name || `Product #${item.product_id}`}</p>
                                                        <p className="order-item-qty">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <p className="order-more-items">+ {order.items.length - 3} more items</p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="order-footer">
                                    <div className="order-items-count">
                                        {order.items?.length || 0} items
                                    </div>
                                    <div>
                                        <span className="order-total-label">Total:</span>
                                        <span className="order-total-value">₹{order.total_amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
