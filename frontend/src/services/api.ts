import axios from 'axios';

// API Base URL - change this for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface Prediction {
  food_type: string;
  status: 'Fresh' | 'Rotten' | 'Unknown';
  confidence: number;
}

export interface PredictionResponse {
  success: boolean;
  predictions?: Prediction[];
  message?: string;
  error?: string;
  count?: number;
}

export interface HealthCheckResponse {
  status: string;
  model_status: string;
}

// API Service class
class FreshnessAPI {
  /**
   * Check if API is running
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Failed to connect to API');
    }
  }

  /**
   * Upload image and get freshness prediction
   */
  async predictFreshness(file: File): Promise<PredictionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to analyze image');
      }
      throw new Error('Network error - please check your connection');
    }
  }

  /**
   * Real-time prediction for camera stream
   */
  async predictFromStream(file: File): Promise<PredictionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/predict-stream`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000, // 5 second timeout for real-time
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to analyze stream');
      }
      throw new Error('Network error');
    }
  }
}

// Export singleton instance
export const freshnessAPI = new FreshnessAPI();

// Export API base URL for direct use
export { API_BASE_URL };