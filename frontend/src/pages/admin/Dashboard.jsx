import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
    const location = useLocation();
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
    });

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: '👥', color: 'from-blue-500 to-cyan-500', change: '+12%' },
        { label: 'Products', value: stats.products, icon: '📦', color: 'from-purple-500 to-pink-500', change: '+5%' },
        { label: 'Orders', value: stats.orders, icon: '🛒', color: 'from-green-500 to-emerald-500', change: '+23%' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'from-orange-500 to-red-500', change: '+18%' },
    ];

    useEffect(() => {
        // Fetch stats from APIs
        setStats({
            users: 156,
            products: 24,
            orders: 89,
            revenue: 125400,
        });
    }, []);

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 min-h-screen bg-dark-900/50 border-r border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                            ⚡
                        </div>
                        <span className="text-lg font-bold text-white">Admin Panel</span>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                        : 'text-dark-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-dark-400">Welcome to the admin panel</p>
                    </div>

                    {/* Mobile Menu */}
                    <div className="lg:hidden flex flex-wrap gap-2 mb-8">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-800 text-dark-300 border border-dark-700'
                                    }`}
                            >
                                {item.icon} {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className="p-6 bg-dark-800/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-dark-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="p-6 bg-dark-800/50 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Recent Orders</h3>
                                <Link to="/admin/orders" className="text-primary-400 text-sm hover:underline">View all</Link>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-lg">
                                                📦
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Order #{1000 + i}</p>
                                                <p className="text-dark-400 text-sm">2 items • ₹{(Math.random() * 1000 + 500).toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-medium">Pending</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-6 bg-dark-800/50 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Add Product', icon: '➕', link: '/admin/products' },
                                    { label: 'View Orders', icon: '📋', link: '/admin/orders' },
                                    { label: 'Manage Users', icon: '👥', link: '/admin/users' },
                                    { label: 'View Shop', icon: '🛍️', link: '/shop' },
                                ].map((action, i) => (
                                    <Link
                                        key={i}
                                        to={action.link}
                                        className="p-4 rounded-xl bg-dark-700/50 border border-dark-600 hover:border-primary-500/30 hover:bg-dark-700 transition-all duration-300 text-center"
                                    >
                                        <div className="text-2xl mb-2">{action.icon}</div>
                                        <p className="text-white text-sm font-medium">{action.label}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
