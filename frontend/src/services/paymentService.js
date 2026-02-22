import api from '../config/api';

export const paymentService = {
    // Create Razorpay order (Step 1: before opening checkout popup)
    createOrder: async (orderData) => {
        const response = await api.post('/api/v1/payment/create-order', orderData);
        return response.data;
    },

    // Verify payment (Step 2: after Razorpay popup success)
    verifyPayment: async (paymentData) => {
        const response = await api.post('/api/v1/payment/verify-payment', paymentData);
        return response.data;
    },

    // Load Razorpay checkout script dynamically
    loadRazorpayScript: () => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    },

    // Open Razorpay checkout popup
    openCheckout: (options) => {
        return new Promise((resolve, reject) => {
            const rzp = new window.Razorpay({
                ...options,
                handler: (response) => resolve(response),
                modal: {
                    ondismiss: () => reject(new Error('Payment cancelled by user')),
                },
            });
            rzp.open();
        });
    },
};
