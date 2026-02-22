import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productService.getProduct(id);
            setProduct(data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = { seeds: '🌱', crops: '🌾', fertilizers: '🧪', tools: '🔧' };
        return icons[category] || '📦';
    };

    const addToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const cartKey = `cart_${user.id}`;
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            existingCart.push({ ...product, quantity });
        }

        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    if (loading) {
        return (
            <div className="pd-page">
                <Navbar />
                <div className="pd-container">
                    <div className="pd-skeleton">
                        <div className="pd-skeleton-image" />
                        <div className="pd-skeleton-info">
                            <div className="pd-skeleton-line pd-skeleton-line-sm" />
                            <div className="pd-skeleton-line pd-skeleton-line-lg" />
                            <div className="pd-skeleton-line pd-skeleton-line-md" />
                            <div className="pd-skeleton-line pd-skeleton-line-xl" />
                            <div className="pd-skeleton-line pd-skeleton-line-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pd-page">
                <Navbar />
                <div className="pd-container">
                    <div className="pd-not-found">
                        <div className="pd-not-found-icon">🔍</div>
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                        <Link to="/shop" className="pd-back-btn">← Back to Shop</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock_quantity === 0;
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

    return (
        <div className="pd-page">
            <Navbar />

            <div className="pd-container">
                {/* Breadcrumb */}
                <nav className="pd-breadcrumb">
                    <Link to="/shop">Shop</Link>
                    <span className="pd-breadcrumb-sep">›</span>
                    <span className="pd-breadcrumb-cat">{product.category}</span>
                    <span className="pd-breadcrumb-sep">›</span>
                    <span className="pd-breadcrumb-current">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="pd-layout">
                    {/* Left: Image */}
                    <div className="pd-image-section">
                        <div className="pd-image-wrapper">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="pd-image" />
                            ) : (
                                <div className="pd-image-placeholder">
                                    <span>{getCategoryIcon(product.category)}</span>
                                </div>
                            )}

                            <div className="pd-image-badge">{product.category}</div>

                            {isLowStock && (
                                <div className="pd-image-stock-badge">Only {product.stock_quantity} left!</div>
                            )}
                            {isOutOfStock && (
                                <div className="pd-image-stock-badge pd-out-of-stock-badge">Out of Stock</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="pd-info-section">
                        <div className="pd-category-tag">
                            <span>{getCategoryIcon(product.category)}</span>
                            <span>{product.category}</span>
                        </div>

                        <h1 className="pd-name">{product.name}</h1>

                        <div className="pd-price-row">
                            <span className="pd-price">₹{product.price?.toFixed(2)}</span>
                            <span className={`pd-availability ${isOutOfStock ? 'pd-availability-out' : 'pd-availability-in'}`}>
                                {isOutOfStock ? '● Out of Stock' : '● In Stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="pd-description-section">
                            <h3 className="pd-section-title">Description</h3>
                            <p className="pd-description">{product.description || 'No description available for this product.'}</p>
                        </div>

                        {/* Product Details */}
                        <div className="pd-details-grid">
                            <div className="pd-detail-item">
                                <span className="pd-detail-label">Category</span>
                                <span className="pd-detail-value">{product.category}</span>
                            </div>
                            <div className="pd-detail-item">
                                <span className="pd-detail-label">Stock</span>
                                <span className="pd-detail-value">
                                    {isOutOfStock ? 'Unavailable' : `${product.stock_quantity} units`}
                                </span>
                            </div>
                            <div className="pd-detail-item">
                                <span className="pd-detail-label">Product ID</span>
                                <span className="pd-detail-value">#{product.id}</span>
                            </div>
                            {product.created_at && (
                                <div className="pd-detail-item">
                                    <span className="pd-detail-label">Listed</span>
                                    <span className="pd-detail-value">
                                        {new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart */}
                        {!isOutOfStock && (
                            <div className="pd-cart-section">
                                <div className="pd-quantity">
                                    <button
                                        className="pd-qty-btn"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >−</button>
                                    <span className="pd-qty-value">{quantity}</span>
                                    <button
                                        className="pd-qty-btn"
                                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                    >+</button>
                                </div>

                                <button
                                    className={`pd-add-btn ${addedToCart ? 'pd-add-btn-success' : ''}`}
                                    onClick={addToCart}
                                >
                                    {addedToCart ? '✓ Added to Cart!' : `Add to Cart — ₹${(product.price * quantity).toFixed(2)}`}
                                </button>
                            </div>
                        )}

                        {isOutOfStock && (
                            <div className="pd-out-of-stock-msg">
                                <span>😔</span>
                                <span>This product is currently out of stock. Check back later!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
