import axios from 'axios';
import type { Format, ScenarioListItem, ScenarioFull, AdminStats, PhraseFull } from '../types/admin';

const api = axios.create({ baseURL: '/api/admin' });

export const adminApi = {
  getFormats: () => api.get<Format[]>('/formats').then(r => r.data),

  getScenarios: () => api.get<ScenarioListItem[]>('/scenarios').then(r => r.data),
  getScenario: (id: number) => api.get<ScenarioFull>(`/scenarios/${id}`).then(r => r.data),
  createScenario: (data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string }) =>
    api.post<ScenarioFull>('/scenarios', data).then(r => r.data),
  updateScenario: (id: number, data: { title: string; situationText: string; recipientName: string; recipientFormatId: number; hintText: string; isActive: boolean }) =>
    api.put<ScenarioFull>(`/scenarios/${id}`, data).then(r => r.data),
  deleteScenario: (id: number) => api.delete(`/scenarios/${id}`),

  updatePhrase: (id: number, data: { text: string; emotionalScore: number; safetyScore: number; structuralScore: number }) =>
    api.put<PhraseFull>(`/phrases/${id}`, data).then(r => r.data),

  getStats: () => api.get<AdminStats>('/stats').then(r => r.data),
};