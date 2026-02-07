import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../../services/userService';
import Navbar from '../../components/Navbar';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            await userService.updateUser(userId, { is_admin: !currentStatus });
            fetchUsers();
        } catch (error) {
            alert('Failed to update user');
        }
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
                        <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
                        <p className="text-dark-400">{users.length} registered users</p>
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

                    {/* Users Grid */}
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-6 bg-dark-800/50 rounded-2xl animate-pulse">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-dark-700" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-dark-700 rounded w-3/4" />
                                            <div className="h-3 bg-dark-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">👥</div>
                            <p className="text-dark-400">No users found</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-6 bg-dark-800/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${user.is_admin ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-primary-500 to-emerald-500'
                                                }`}>
                                                {user.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{user.name}</h3>
                                                <p className="text-dark-400 text-sm">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-sm text-dark-400">
                                                <span>📱</span>
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-dark-400">
                                            <span>📅</span>
                                            <span>Joined {formatDate(user.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                                        <div className="flex items-center gap-2">
                                            {user.is_admin ? (
                                                <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/30">Admin</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-lg bg-dark-700 text-dark-300 text-xs font-medium">User</span>
                                            )}
                                            {user.is_active && (
                                                <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">Active</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${user.is_admin
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                                }`}
                                        >
                                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminUsers;
