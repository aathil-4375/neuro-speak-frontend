import api from './api';

export const patientService = {
  async getAllPatients() {
    const response = await api.get('/patients/');
    return response;
  },

  async getPatient(patientId) {
    const response = await api.get(`/patients/${patientId}/`);
    return response;
  },

  async createPatient(patientData) {
    const response = await api.post('/patients/', patientData);
    return response;
  },

  async updatePatient(patientId, patientData) {
    const response = await api.put(`/patients/${patientId}/`, patientData);
    return response;
  },

  async deletePatient(patientId) {
    const response = await api.delete(`/patients/${patientId}/`);
    return response;
  },

  async searchPatients(query) {
    const response = await api.get('/patients/search/', {
      params: { query }
    });
    return response;
  }
};