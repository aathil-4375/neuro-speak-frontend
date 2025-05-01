// frontend/src/services/progress.js
import api from './api';

export const progressService = {
  async getPatientSummary(patientId) {
    const response = await api.get(`/progress/patient/${patientId}/summary/`);
    return response;
  },

  async getChapterWords(chapterNumber) {
    const response = await api.get(`/progress/chapter/${chapterNumber}/words/`);
    return response;
  },

  async getWordProgress(patientId, chapterNumber, word) {
    const response = await api.get(`/progress/patient/${patientId}/chapter/${chapterNumber}/word/${word}/`);
    return response;
  },

  async createProgress(progressData) {
    const response = await api.post('/progress/create/', progressData);
    return response;
  },

  async createSessionHistory(sessionData) {
    const response = await api.post('/progress/session-history/create/', sessionData);
    return response;
  }
};
