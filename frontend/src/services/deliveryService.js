import api from '../config/api';

export const deliveryService = {
    // ─── Auth ─────────────────────────────────────────────
    login: async (credentials) => {
        const response = await api.post('/api/v1/delivery/login', credentials);
        return response.data;
    },

    getMyProfile: async () => {
        const response = await api.get('/api/v1/delivery/me');
        return response.data;
    },

    updateMyProfile: async (data) => {
        const response = await api.patch('/api/v1/delivery/me', data);
        return response.data;
    },

    // ─── Dashboard (delivery staff) ───────────────────────
    getMyOrders: async (params) => {
        const response = await api.get('/api/v1/delivery/my-orders', { params });
        return response.data;
    },

    updateDeliveryStatus: async (orderId, data) => {
        const response = await api.patch(`/api/v1/delivery/orders/${orderId}/status`, data);
        return response.data;
    },

    // ─── Admin: manage delivery staff ─────────────────────
    createStaff: async (data) => {
        const response = await api.post('/api/v1/delivery/', data);
        return response.data;
    },

    getAllStaff: async (params) => {
        const response = await api.get('/api/v1/delivery/', { params });
        return response.data;
    },

    getStaffById: async (id) => {
        const response = await api.get(`/api/v1/delivery/${id}`);
        return response.data;
    },

    toggleStaffActive: async (id) => {
        const response = await api.patch(`/api/v1/delivery/${id}/toggle-active`);
        return response.data;
    },

    getStaffByDistrict: async (district) => {
        const response = await api.get(`/api/v1/delivery/district/${encodeURIComponent(district)}`);
        return response.data;
    },

    // ─── Admin: assign orders ─────────────────────────────
    assignToOrder: async (orderId, deliveryStaffId) => {
        const response = await api.post(`/api/v1/delivery/assign/${orderId}`, {
            delivery_staff_id: deliveryStaffId,
        });
        return response.data;
    },

    autoAssign: async (orderId) => {
        const response = await api.post(`/api/v1/delivery/auto-assign/${orderId}`);
        return response.data;
    },

    unassign: async (orderId) => {
        const response = await api.delete(`/api/v1/delivery/unassign/${orderId}`);
        return response.data;
    },
};
