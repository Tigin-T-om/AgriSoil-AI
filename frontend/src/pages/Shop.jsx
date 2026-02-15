import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const categories = [
        { id: 'all', label: 'All Products', icon: '🌍' },
        { id: 'seeds', label: 'Seeds', icon: '🌱' },
        { id: 'crops', label: 'Crops', icon: '🌾' },
        { id: 'fertilizers', label: 'Fertilizers', icon: '🧪' },
        { id: 'tools', label: 'Tools', icon: '🔧' },
    ];

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'all') params.category = category;
            if (searchQuery) params.search = searchQuery;

            const data = await productService.getProducts(params);
            setProducts(data.filter(p => p.is_available));
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const cartKey = `cart_${user.id}`;
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            existingCart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem(cartKey, JSON.stringify(existingCart));

        // Show toast notification
        showToast(`${product.name} added to cart!`);
    };

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'shop-toast';
        toast.innerHTML = `<span>✓</span><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    return (
        <div className="shop-page">
            <Navbar />

            {/* Hero Section */}
            <section className="shop-hero">
                <div className="shop-hero-bg" />
                <div className="shop-hero-glow" />

                <div className="shop-hero-content">
                    <div className="shop-hero-text">
                        <h1 className="shop-title">
                            Agricultural <span className="shop-title-gradient">Marketplace</span>
                        </h1>
                        <p className="shop-subtitle">
                            Discover premium seeds, crops, fertilizers, and tools for your farming needs
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="shop-search-wrapper">
                        <div className="shop-search-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                                placeholder="Search products..."
                                className="shop-search-input"
                            />
                            <svg className="shop-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <button onClick={fetchProducts} className="shop-search-btn">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories & Products */}
            <section className="shop-products-section">
                <div className="shop-container">
                    {/* Category Tabs */}
                    <div className="shop-categories">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`shop-category-btn ${category === cat.id ? 'shop-category-active' : 'shop-category-inactive'}`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="shop-products-grid">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton-image" />
                                    <div className="skeleton-content">
                                        <div className="skeleton-line skeleton-line-sm" />
                                        <div className="skeleton-line skeleton-line-md" />
                                        <div className="skeleton-line skeleton-line-lg" />
                                        <div className="skeleton-btn" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="shop-empty">
                            <div className="shop-empty-icon">🔍</div>
                            <h3 className="shop-empty-title">No products found</h3>
                            <p className="shop-empty-text">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <div className="shop-products-grid">
                            {products.map((product) => (
                                <div key={product.id} className="product-card">
                                    {/* Image */}
                                    <div className="product-image-wrapper">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                        ) : (
                                            <div className="product-placeholder">
                                                {product.category === 'seeds' ? '🌱' :
                                                    product.category === 'crops' ? '🌾' :
                                                        product.category === 'fertilizers' ? '🧪' : '🛠️'}
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="product-category-badge">
                                            {product.category}
                                        </div>

                                        {/* Stock Badge */}
                                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                            <div className="product-stock-badge">
                                                Only {product.stock_quantity} left
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="product-content">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-description">{product.description}</p>

                                        <div className="product-footer">
                                            <span className="product-price">₹{product.price}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.stock_quantity === 0}
                                                className={`product-add-btn ${product.stock_quantity === 0 ? 'product-add-btn-disabled' : 'product-add-btn-active'}`}
                                            >
                                                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Shop;
