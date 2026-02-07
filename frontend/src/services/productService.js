import api from '../config/api';

export const productService = {
    // Get all products
    getProducts: async (params) => {
        const response = await api.get('/api/v1/products/', { params });
        return response.data;
    },

    // Search products by crop name (for soil analysis)
    searchByCrop: async (cropName, limit = 5) => {
        const response = await api.get(`/api/v1/products/search/by-crop/${cropName}`, {
            params: { limit }
        });
        return response.data;
    },

    // Search products by multiple crop names (for soil analysis alternatives)
    searchByMultipleCrops: async (cropNames, limit = 6) => {
        const response = await api.post('/api/v1/products/search/by-crops', cropNames, {
            params: { limit }
        });
        return response.data;
    },

    // Create product
    createProduct: async (productData) => {
        const response = await api.post('/api/v1/products/', productData);
        return response.data;
    },

    // Update product
    updateProduct: async (id, productData) => {
        const response = await api.put(`/api/v1/products/${id}`, productData);
        return response.data;
    },

    // Delete product
    deleteProduct: async (id) => {
        const response = await api.delete(`/api/v1/products/${id}`);
        return response.data;
    }
};

