import api from '../config/api';

export const orderService = {
    // Get all orders (Admin)
    getAllOrders: async (params) => {
        const response = await api.get('/api/v1/orders/all', { params });
        return response.data;
    },

    // Get my orders
    getMyOrders: async (params) => {
        const response = await api.get('/api/v1/orders/', { params });
        return response.data;
    },

    // Create order
    createOrder: async (orderData) => {
        const response = await api.post('/api/v1/orders/', orderData);
        return response.data;
    },

    // Update order status
    updateStatus: async (id, status) => {
        const response = await api.patch(`/api/v1/orders/${id}/status`, null, { params: { new_status: status } });
        return response.data;
    }
};
