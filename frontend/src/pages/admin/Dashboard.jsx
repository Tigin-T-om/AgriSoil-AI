import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [productsData, ordersData, usersData] = await Promise.allSettled([
                productService.getProducts(),
                orderService.getAllOrders(),
                userService.getAllUsers(),
            ]);

            const products = productsData.status === 'fulfilled' ? productsData.value : [];
            const orders = ordersData.status === 'fulfilled' ? ordersData.value : [];
            const users = usersData.status === 'fulfilled' ? usersData.value : [];

            const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

            setStats({
                users: users.length,
                products: products.length,
                orders: orders.length,
                revenue: totalRevenue,
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Dashboard data fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: '👥', iconClass: 'admin-stat-icon-blue', change: '+12%', up: true },
        { label: 'Products', value: stats.products, icon: '📦', iconClass: 'admin-stat-icon-purple', change: '+5%', up: true },
        { label: 'Orders', value: stats.orders, icon: '🛒', iconClass: 'admin-stat-icon-green', change: '+23%', up: true },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', iconClass: 'admin-stat-icon-orange', change: '+18%', up: true },
    ];

    const quickActions = [
        { label: 'Add Product', icon: '➕', link: '/admin/products' },
        { label: 'View Orders', icon: '📋', link: '/admin/orders' },
        { label: 'Manage Users', icon: '👥', link: '/admin/users' },
        { label: 'View Shop', icon: '🛍️', link: '/shop' },
    ];

    const getStatusBadge = (status) => {
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

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
        <AdminLayout title="Dashboard" subtitle="Welcome to the admin panel. Here's an overview of your platform.">
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="admin-stats-grid">
                        {statCards.map((stat, i) => (
                            <div key={i} className="admin-stat-card">
                                <div className="admin-stat-top">
                                    <div className={`admin-stat-icon ${stat.iconClass}`}>
                                        {stat.icon}
                                    </div>
                                    <span className={`admin-stat-change ${stat.up ? 'admin-stat-change-up' : 'admin-stat-change-down'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="admin-stat-value">{stat.value}</div>
                                <div className="admin-stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Widgets */}
                    <div className="admin-widgets-grid">
                        {/* Recent Orders */}
                        <div className="admin-widget">
                            <div className="admin-widget-header">
                                <h3 className="admin-widget-title">Recent Orders</h3>
                                <Link to="/admin/orders" className="admin-widget-link">View all →</Link>
                            </div>
                            <div className="admin-widget-list">
                                {recentOrders.length === 0 ? (
                                    <p style={{ color: 'var(--dark-500)', fontSize: '0.85rem' }}>No orders yet</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="admin-widget-item">
                                            <div className="admin-widget-item-left">
                                                <div className="admin-widget-item-icon">📦</div>
                                                <div>
                                                    <div className="admin-widget-item-title">Order #{order.id}</div>
                                                    <div className="admin-widget-item-sub">
                                                        {order.items?.length || 0} items • ₹{order.total_amount?.toFixed(0) || 0}
                                                        {order.created_at && ` • ${formatDate(order.created_at)}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="admin-widget">
                            <div className="admin-widget-header">
                                <h3 className="admin-widget-title">Quick Actions</h3>
                            </div>
                            <div className="admin-quick-actions">
                                {quickActions.map((action, i) => (
                                    <Link key={i} to={action.link} className="admin-quick-action">
                                        <span className="admin-quick-action-icon">{action.icon}</span>
                                        <span className="admin-quick-action-label">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
