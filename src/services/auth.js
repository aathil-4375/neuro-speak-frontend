// frontend/src/services/auth.js
import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  async login(username, password) {
    try {
      const response = await api.post('/users/login/', { username, password });
      const { access, refresh } = response.data;
      
      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Fetch user profile after successful login
        const userProfile = await this.getCurrentUser();
        return { user: userProfile };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};