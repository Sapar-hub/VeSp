// src/io/api.ts

import { Scene } from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

interface User {
  id: string;
  email: string;
}

interface AuthResponseData {
  user: User;
  token: string;
}

// Helper function to get authenticated headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  async register(email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async saveScene(name: string, sceneData: any): Promise<ApiResponse<Scene>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, sceneData }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async getScenes(): Promise<ApiResponse<Scene[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async getSceneById(id: string): Promise<ApiResponse<Scene>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async updateScene(id: string, name: string, sceneData: any): Promise<ApiResponse<Scene>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, sceneData }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  async deleteScene(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.error || response.statusText };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  },
};
