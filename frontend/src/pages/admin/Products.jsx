import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productService } from '../../services/productService';
import Navbar from '../../components/Navbar';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '',
    });
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = { ...formData, price: parseFloat(formData.price), stock_quantity: parseInt(formData.stock_quantity) };
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
            } else {
                await productService.createProduct(productData);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '' });
            fetchProducts();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name, description: product.description || '', category: product.category,
            price: product.price.toString(), stock_quantity: product.stock_quantity.toString(), image_url: product.image_url || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

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
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                            <p className="text-dark-400">{products.length} products in catalog</p>
                        </div>
                        <button
                            onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '' }); setShowModal(true); }}
                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 flex items-center gap-2"
                        >
                            <span>➕</span><span>Add Product</span>
                        </button>
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

                    {/* Products Table */}
                    {loading ? (
                        <div className="text-center py-20 text-dark-400">Loading...</div>
                    ) : (
                        <div className="bg-dark-800/50 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-dark-700">
                                            <th className="text-left p-4 text-dark-400 font-medium">Product</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Category</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Price</th>
                                            <th className="text-left p-4 text-dark-400 font-medium">Stock</th>
                                            <th className="text-right p-4 text-dark-400 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b border-dark-700/50 hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-2xl">
                                                            {product.category === 'seeds' ? '🌱' : product.category === 'crops' ? '🌾' : product.category === 'fertilizers' ? '🧪' : '🛠️'}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{product.name}</p>
                                                            <p className="text-dark-400 text-sm line-clamp-1">{product.description?.substring(0, 40)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm capitalize">{product.category}</span>
                                                </td>
                                                <td className="p-4 text-white font-medium">₹{product.price}</td>
                                                <td className="p-4">
                                                    <span className={`${product.stock_quantity > 10 ? 'text-green-400' : product.stock_quantity > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        {product.stock_quantity}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleEdit(product)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">✏️</button>
                                                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg p-6 bg-dark-900 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 outline-none" />
                            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 outline-none resize-none" />
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white outline-none">
                                <option value="seeds">Seeds</option>
                                <option value="crops">Crops</option>
                                <option value="fertilizers">Fertilizers</option>
                                <option value="tools">Tools</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 outline-none" />
                                <input type="number" placeholder="Stock Qty" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required
                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 outline-none" />
                            </div>
                            <input type="text" placeholder="Image URL (optional)" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 outline-none" />
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-dark-700 text-white font-medium hover:bg-dark-600 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">{editingProduct ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
