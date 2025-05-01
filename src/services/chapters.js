import api from './api';

export const chapterService = {
  getAllChapters: async () => {
    return await api.get('/chapters/');
  },

  getChapter: async (chapterNumber) => {
    return await api.get(`/chapters/${chapterNumber}/`);
  },

  getChapterWords: async (chapterNumber) => {
    return await api.get(`/chapters/${chapterNumber}/words/`);
  },
};