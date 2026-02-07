import api from '../config/api';

export const mlService = {
  // Predict crop based on soil data (Legacy - ML only)
  predictCrop: async (soilData) => {
    const response = await api.post('/api/v1/model/predict', soilData);
    return response.data;
  },

  // Classify soil type
  classifySoil: async (soilData) => {
    const response = await api.post('/api/v1/model/classify-soil', soilData);
    return response.data;
  },

  // Combined ML analysis (soil + crop)
  analyze: async (soilData) => {
    const response = await api.post('/api/v1/model/analyze', soilData);
    return response.data;
  },

  // Hybrid analysis - ML + Rule-Based (MAIN METHOD)
  hybridAnalyze: async (soilData) => {
    const response = await api.post('/api/v1/model/hybrid-analyze', soilData);
    return response.data;
  },

  // Get model status
  getModelStatus: async () => {
    const response = await api.get('/api/v1/model/model-status');
    return response.data;
  },
};
