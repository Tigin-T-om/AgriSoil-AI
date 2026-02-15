import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService } from '../../services/productService';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '',
    });

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
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
            };
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
            } else {
                await productService.createProduct(productData);
            }
            closeModal();
            fetchProducts();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            category: product.category,
            price: product.price.toString(),
            stock_quantity: product.stock_quantity.toString(),
            image_url: product.image_url || '',
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

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', category: 'seeds', price: '', stock_quantity: '', image_url: '' });
    };

    const getCategoryIcon = (cat) => {
        const icons = { seeds: '🌱', crops: '🌾', fertilizers: '🧪', tools: '🛠️' };
        return icons[cat] || '📦';
    };

    const getStockClass = (qty) => {
        if (qty > 10) return 'admin-stock-high';
        if (qty > 0) return 'admin-stock-low';
        return 'admin-stock-out';
    };

    return (
        <AdminLayout
            title="Products"
            subtitle={`${products.length} products in catalog`}
            actions={
                <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>
                    <span>➕</span>
                    <span>Add Product</span>
                </button>
            }
        >
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                </div>
            ) : products.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">📦</div>
                    <h3 className="admin-empty-title">No products yet</h3>
                    <p className="admin-empty-text">Start by adding your first product</p>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="admin-cell-product">
                                                <div className="admin-cell-icon">
                                                    {getCategoryIcon(product.category)}
                                                </div>
                                                <div>
                                                    <div className="admin-cell-title">{product.name}</div>
                                                    <div className="admin-cell-sub">
                                                        {product.description?.substring(0, 45)}{product.description?.length > 45 ? '...' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-badge admin-badge-purple">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="admin-cell-price">₹{product.price}</td>
                                        <td>
                                            <span className={getStockClass(product.stock_quantity)}>
                                                {product.stock_quantity} units
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${product.is_available ? 'admin-badge-green' : 'admin-badge-red'}`}>
                                                {product.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-cell-actions">
                                                <button onClick={() => handleEdit(product)} className="admin-btn-icon admin-btn-icon-edit" title="Edit">✏️</button>
                                                <button onClick={() => handleDelete(product.id)} className="admin-btn-icon admin-btn-icon-delete" title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="admin-modal">
                        <h2 className="admin-modal-title">
                            {editingProduct ? '✏️ Edit Product' : '➕ Add Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="admin-modal-form">
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="admin-modal-input"
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="admin-modal-input"
                                style={{ resize: 'none' }}
                            />
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="admin-modal-input"
                            >
                                <option value="seeds">🌱 Seeds</option>
                                <option value="crops">🌾 Crops</option>
                                <option value="fertilizers">🧪 Fertilizers</option>
                                <option value="tools">🛠️ Tools</option>
                            </select>
                            <div className="admin-modal-row">
                                <input
                                    type="number"
                                    placeholder="Price (₹)"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    className="admin-modal-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock Qty"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    required
                                    className="admin-modal-input"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Image URL (optional)"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="admin-modal-input"
                            />
                            <div className="admin-modal-actions">
                                <button type="button" onClick={closeModal} className="admin-modal-cancel">Cancel</button>
                                <button type="submit" className="admin-modal-submit">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProducts;
