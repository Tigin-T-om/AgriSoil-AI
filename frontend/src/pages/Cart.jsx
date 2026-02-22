import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import Navbar from '../components/Navbar';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stockErrors, setStockErrors] = useState({});
    const [paymentStep, setPaymentStep] = useState(''); // '', 'creating', 'paying', 'verifying'
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        shipping_address: '',
        phone_number: '',
        notes: '',
    });
    const [addressErrors, setAddressErrors] = useState({});
    const { user } = useAuth();
    const navigate = useNavigate();

    const cartKey = user ? `cart_${user.id}` : 'cart';

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        setCart(savedCart);
        validateAllStock(savedCart);
    }, [cartKey]);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem(cartKey, JSON.stringify(newCart));
        validateAllStock(newCart);
    };

    const validateAllStock = (cartItems) => {
        const errors = {};
        cartItems.forEach(item => {
            if (item.stock_quantity != null && item.quantity > item.stock_quantity) {
                errors[item.id] = `Only ${item.stock_quantity} available in stock`;
            }
        });
        setStockErrors(errors);
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

    const handleQuantityInput = (productId, value) => {
        const parsed = parseInt(value, 10);
        if (value === '') {
            const newCart = cart.map(item =>
                item.id === productId ? { ...item, quantity: '' } : item
            );
            setCart(newCart);
            return;
        }
        if (isNaN(parsed) || parsed < 1) return;

        const newCart = cart.map(item =>
            item.id === productId ? { ...item, quantity: parsed } : item
        );
        updateCart(newCart);
    };

    const handleQuantityBlur = (productId) => {
        const newCart = cart.map(item => {
            if (item.id === productId && (item.quantity === '' || item.quantity < 1)) {
                return { ...item, quantity: 1 };
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

    const hasStockErrors = Object.keys(stockErrors).length > 0;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (typeof item.quantity === 'number' ? item.quantity : 0)), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    // --- Razorpay Payment Flow ---

    const handleCheckoutClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (cart.length === 0 || hasStockErrors) return;

        // Show address modal
        setShowAddressModal(true);
    };

    const validateAddress = () => {
        const errors = {};
        if (!addressForm.shipping_address.trim()) {
            errors.shipping_address = 'Shipping address is required';
        }
        if (addressForm.shipping_address.trim().length < 10) {
            errors.shipping_address = 'Please enter a complete address';
        }
        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePayWithRazorpay = async () => {
        if (!validateAddress()) return;

        setLoading(true);
        setPaymentStep('creating');

        try {
            // Step 1: Load Razorpay script
            const scriptLoaded = await paymentService.loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay. Check your internet connection.');
            }

            // Step 2: Create Razorpay order on backend
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
                shipping_address: addressForm.shipping_address.trim(),
                phone_number: addressForm.phone_number.trim() || null,
                notes: addressForm.notes.trim() || null,
            };

            const razorpayOrder = await paymentService.createOrder(orderData);

            // Step 3: Open Razorpay checkout popup
            setPaymentStep('paying');

            const paymentResponse = await paymentService.openCheckout({
                key: razorpayOrder.key_id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'Agri-Soil AI',
                description: `Order #${razorpayOrder.db_order_id}`,
                order_id: razorpayOrder.razorpay_order_id,
                prefill: {
                    name: user.full_name || user.username,
                    email: user.email,
                    contact: addressForm.phone_number || user.phone_number || '',
                },
                theme: {
                    color: '#22c55e',
                },
                notes: {
                    db_order_id: razorpayOrder.db_order_id.toString(),
                },
            });

            // Step 4: Verify payment on backend
            setPaymentStep('verifying');

            await paymentService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                db_order_id: razorpayOrder.db_order_id,
            });

            // Success! Clear cart and navigate
            clearCart();
            setShowAddressModal(false);
            navigate('/my-orders');

        } catch (error) {
            console.error('Payment failed:', error);

            if (error.message === 'Payment cancelled by user') {
                // User closed the Razorpay popup — not an error
                setPaymentStep('');
            } else {
                alert(error.response?.data?.detail || error.message || 'Payment failed. Please try again.');
            }
        } finally {
            setLoading(false);
            setPaymentStep('');
        }
    };

    const getPaymentStepText = () => {
        switch (paymentStep) {
            case 'creating': return 'Creating order...';
            case 'paying': return 'Waiting for payment...';
            case 'verifying': return 'Verifying payment...';
            default: return 'Processing...';
        }
    };

    const getCategoryIcon = (category) => {
        const icons = { seeds: '🌱', crops: '🌾', fertilizers: '🧪', tools: '🔧' };
        return icons[category] || '📦';
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
                            {cart.map((item) => {
                                const itemStockError = stockErrors[item.id];
                                const isOverStock = !!itemStockError;

                                return (
                                    <div key={item.id} className={`cart-item ${isOverStock ? 'cart-item-error' : ''}`}>
                                        {/* Image */}
                                        <div className="cart-item-image">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} />
                                            ) : (
                                                <div className="cart-item-placeholder">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="cart-item-details">
                                            <div className="cart-item-header">
                                                <div>
                                                    <h3 className="cart-item-name">{item.name}</h3>
                                                    <p className="cart-item-category">{item.category}</p>
                                                    {item.stock_quantity != null && (
                                                        <p className="cart-item-stock">
                                                            {item.stock_quantity > 0
                                                                ? `${item.stock_quantity} in stock`
                                                                : 'Out of stock'}
                                                        </p>
                                                    )}
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="cart-item-remove">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="cart-item-footer">
                                                {/* Quantity */}
                                                <div className="cart-quantity-wrap">
                                                    <div className="cart-quantity">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="cart-quantity-btn"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className={`cart-quantity-input ${isOverStock ? 'cart-quantity-input-error' : ''}`}
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                                                            onBlur={() => handleQuantityBlur(item.id)}
                                                            min={1}
                                                            max={item.stock_quantity || undefined}
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="cart-quantity-btn"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {isOverStock && (
                                                        <p className="cart-stock-error">
                                                            ⚠️ {itemStockError}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="cart-item-price">
                                                    <p className="cart-item-total">₹{(item.price * (typeof item.quantity === 'number' ? item.quantity : 0)).toFixed(2)}</p>
                                                    <p className="cart-item-each">₹{item.price} each</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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

                                {hasStockErrors && (
                                    <div className="cart-stock-warning">
                                        <span>⚠️</span>
                                        <span>Some items exceed available stock. Please adjust quantities before checkout.</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckoutClick}
                                    disabled={loading || cart.length === 0 || hasStockErrors}
                                    className="cart-checkout-btn"
                                >
                                    {loading ? (
                                        <>
                                            <div className="cart-spinner" />
                                            {getPaymentStepText()}
                                        </>
                                    ) : (
                                        <>
                                            <span>💳</span>
                                            <span>Pay with Razorpay</span>
                                        </>
                                    )}
                                </button>

                                <div className="cart-payment-methods">
                                    <p className="cart-payment-note">
                                        Secure payment via Razorpay
                                    </p>
                                    <div className="cart-payment-icons">
                                        <span title="UPI">📱 UPI</span>
                                        <span title="Cards">💳 Cards</span>
                                        <span title="Net Banking">🏦 NetBanking</span>
                                        <span title="Wallets">👛 Wallets</span>
                                    </div>
                                </div>
                            </div>

                            {/* Razorpay Test Mode Badge */}
                            <div className="cart-test-mode-badge">
                                <span className="cart-test-dot"></span>
                                <span>Razorpay Test Mode</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="cart-modal-overlay" onClick={() => !loading && setShowAddressModal(false)}>
                    <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-modal-header">
                            <h2 className="cart-modal-title">Shipping Details</h2>
                            <button
                                className="cart-modal-close"
                                onClick={() => !loading && setShowAddressModal(false)}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="cart-modal-body">
                            <div className="cart-modal-field">
                                <label className="cart-modal-label">
                                    Shipping Address <span className="cart-required">*</span>
                                </label>
                                <textarea
                                    className={`cart-modal-textarea ${addressErrors.shipping_address ? 'cart-modal-input-error' : ''}`}
                                    placeholder="Enter your full shipping address..."
                                    value={addressForm.shipping_address}
                                    onChange={(e) => {
                                        setAddressForm({ ...addressForm, shipping_address: e.target.value });
                                        if (addressErrors.shipping_address) {
                                            setAddressErrors({ ...addressErrors, shipping_address: '' });
                                        }
                                    }}
                                    rows={3}
                                    disabled={loading}
                                />
                                {addressErrors.shipping_address && (
                                    <p className="cart-modal-error">{addressErrors.shipping_address}</p>
                                )}
                            </div>

                            <div className="cart-modal-field">
                                <label className="cart-modal-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="cart-modal-input"
                                    placeholder="e.g., +91 9876543210"
                                    value={addressForm.phone_number}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="cart-modal-field">
                                <label className="cart-modal-label">Order Notes</label>
                                <input
                                    type="text"
                                    className="cart-modal-input"
                                    placeholder="Any special instructions..."
                                    value={addressForm.notes}
                                    onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="cart-modal-summary">
                                <div className="cart-modal-summary-row">
                                    <span>Total Amount</span>
                                    <span className="cart-modal-total">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="cart-modal-footer">
                            <button
                                className="cart-modal-cancel"
                                onClick={() => setShowAddressModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="cart-modal-pay-btn"
                                onClick={handlePayWithRazorpay}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="cart-spinner" />
                                        {getPaymentStepText()}
                                    </>
                                ) : (
                                    <>
                                        <span>🔒</span>
                                        <span>Pay ₹{total.toFixed(2)}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
