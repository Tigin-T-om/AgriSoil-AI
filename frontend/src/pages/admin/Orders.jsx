import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import Navbar from '../../components/Navbar';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

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
            await orderService.updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-dark-700 text-dark-300';
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 min-h-screen bg-dark-900/50 border-r border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">⚡</div>
                        <span className="text-lg font-bold text-white">Admin Panel</span>
                    </div>
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-dark-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span>{item.icon}</span><span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
                        <p className="text-dark-400">{orders.length} total orders</p>
                    </div>

                    {/* Mobile Menu */}
                    <div className="lg:hidden flex flex-wrap gap-2 mb-6">
                        {menuItems.map((item) => (
                            <Link key={item.path} to={item.path}
                                className={`px-3 py-2 rounded-lg text-sm ${location.pathname === item.path ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300'}`}
                            >
                                {item.icon} {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Orders Table */}
                    {loading ? (
                        <div className="text-center py-20 text-dark-400">Loading...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">📦</div>
                            <p className="text-dark-400">No orders yet</p>
                        </div>
                    ) : (
                        <div className="bg-dark-800/50 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-dark-700">
                                            <th className="text-left p-4 text-dark-400 font-medium">Order ID</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Customer</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Items</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Total</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Status</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b border-dark-700/50 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-white font-medium">#{order.id}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="text-white">{order.user?.name || 'Unknown'}</p>
                                                        <p className="text-dark-400 text-sm">{order.user?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-dark-300">{order.items?.length || 0} items</td>
                                                <td className="p-4 text-white font-medium">₹{order.total_amount?.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status} className="bg-dark-900 text-white">{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4 text-dark-400">{formatDate(order.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminOrders;
