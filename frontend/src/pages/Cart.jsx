import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import Navbar from '../components/Navbar';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const updateQuantity = (productId, delta) => {
        const newCart = cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        updateCart(newCart);
    };

    const removeItem = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        updateCart(newCart);
    };

    const clearCart = () => {
        updateCart([]);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) return;

        setLoading(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                total_amount: total,
            };

            await orderService.createOrder(orderData);
            clearCart();
            navigate('/my-orders');
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cart-page">
            <Navbar />

            <div className="cart-container">
                {/* Header */}
                <div className="cart-header">
                    <div>
                        <h1 className="cart-title">Shopping Cart</h1>
                        <p className="cart-count">{cart.length} items in your cart</p>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="cart-clear-btn">
                            Clear Cart
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    /* Empty Cart */
                    <div className="cart-empty">
                        <div className="cart-empty-icon">
                            <span>🛒</span>
                        </div>
                        <h2 className="cart-empty-title">Your cart is empty</h2>
                        <p className="cart-empty-text">Looks like you haven't added any products yet</p>
                        <Link to="/shop" className="cart-empty-btn">
                            <span>🛍️</span>
                            <span>Start Shopping</span>
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    {/* Image */}
                                    <div className="cart-item-image">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} />
                                        ) : (
                                            <div className="cart-item-placeholder">🌱</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="cart-item-details">
                                        <div className="cart-item-header">
                                            <div>
                                                <h3 className="cart-item-name">{item.name}</h3>
                                                <p className="cart-item-category">{item.category}</p>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="cart-item-remove">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="cart-item-footer">
                                            {/* Quantity */}
                                            <div className="cart-quantity">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="cart-quantity-btn">
                                                    −
                                                </button>
                                                <span className="cart-quantity-value">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="cart-quantity-btn">
                                                    +
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="cart-item-price">
                                                <p className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="cart-item-each">₹{item.price} each</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="cart-summary">
                            <div className="cart-summary-card">
                                <h3 className="cart-summary-title">Order Summary</h3>

                                <div className="cart-summary-rows">
                                    <div className="cart-summary-row">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="cart-summary-row">
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? <span className="cart-free-shipping">Free</span> : `₹${shipping}`}</span>
                                    </div>
                                    {subtotal < 500 && (
                                        <p className="cart-shipping-hint">
                                            Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                                        </p>
                                    )}
                                    <div className="cart-summary-divider">
                                        <div className="cart-summary-total">
                                            <span>Total</span>
                                            <span className="cart-total-value">₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || cart.length === 0}
                                    className="cart-checkout-btn"
                                >
                                    {loading ? (
                                        <>
                                            <div className="cart-spinner" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span>🔒</span>
                                            <span>Secure Checkout</span>
                                        </>
                                    )}
                                </button>

                                <p className="cart-payment-note">
                                    We accept all major cards & UPI
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
